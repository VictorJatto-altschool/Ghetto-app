type Audience = 'public' | 'followers';
type LocalPost = {
  id: string;
  body: string;
  audience: Audience;
  campus: string;
  createdAt: string;
  image?: Blob | null;
  media?: Blob | null;
  mediaType?: 'image' | 'video' | 'text';
  imageName: string;
};

const databaseName = 'ghetto-app-street-views-v1';
const storeName = 'local-posts';
const maxVideoBytes = 100 * 1024 * 1024;
const allowedVideoTypes = new Set(['video/mp4', 'video/webm']);

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('This browser does not support local post storage.')); return; }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local post storage.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Local save failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Local save was cancelled.'));
  });
}

class StreetViewsScreen {
  private posts: LocalPost[] = [];
  private filter: Audience | 'all' = 'all';
  private pendingMedia: File | null = null;
  private mediaUrl: string | null = null;
  private composerOpen = false;
  private videoObserver: IntersectionObserver | null = null;
  private objectUrls: string[] = [];
  private error = '';
  private draftBody = '';
  private draftCampus = '';
  private draftAudience: Audience = 'public';
  private loading = true;
  private saving = false;

  constructor(private root: HTMLElement, private announce: (message: string) => void, private onBack: () => void) {
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('change', this.onChange);
    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('submit', this.onSubmit);
    this.render();
    void this.load();
  }

  destroy(): void {
    this.root.removeEventListener('click', this.onClick);
    this.root.removeEventListener('change', this.onChange);
    this.root.removeEventListener('input', this.onInput);
    this.root.removeEventListener('submit', this.onSubmit);
    this.clearObjectUrls();
    this.videoObserver?.disconnect();
  }

  private async load(): Promise<void> {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readonly');
      const request = transaction.objectStore(storeName).getAll() as IDBRequest<LocalPost[]>;
      this.posts = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Could not read local posts.'));
      });
      this.posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      db.close();
      this.error = '';
      this.loading = false;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Could not load local posts.';
      this.loading = false;
    }
    this.render();
  }

  private async save(post: LocalPost): Promise<void> {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(post);
    await transactionDone(transaction);
    db.close();
  }

  private async remove(id: string): Promise<void> {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    await transactionDone(transaction);
    db.close();
  }

  private authorName(): string {
    try {
      const profile = JSON.parse(localStorage.getItem('ghetto-app-local-profile-v1') ?? '{}') as { name?: string; username?: string };
      return profile.name?.trim() || (profile.username ? `@${profile.username}` : 'You');
    } catch { return 'You'; }
  }

  private clearObjectUrls(): void {
    this.videoObserver?.disconnect();
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls = [];
  }

  private createImageUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.objectUrls.push(url);
    return url;
  }

  private visiblePosts(): LocalPost[] {
    let filtered = this.posts.filter((post) => (post.mediaType ?? (post.image ? 'image' : 'text')) === 'video');
    if (this.filter === 'public' || this.filter === 'followers') filtered = filtered.filter((post) => post.audience === this.filter);
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private renderPost(post: LocalPost): string {
    const mediaBlob = post.media ?? post.image ?? null;
    const mediaType = post.mediaType ?? (post.image ? 'image' : 'text');
    const videoUrl = mediaBlob && mediaType === 'video' ? this.createImageUrl(mediaBlob) : '';
    const image = mediaBlob && mediaType !== 'video' ? `<figure class="street-post-media"><img src="${this.createImageUrl(mediaBlob)}" alt="Attached preview: ${escapeHtml(post.imageName)}"><figcaption>${escapeHtml(post.imageName)} · stored on this device</figcaption></figure>` : '';
    const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(post.createdAt));
    if (mediaType === 'video' && videoUrl) return `<article class="street-post street-video-post"><div class="street-video-stage"><video src="${videoUrl}" playsinline muted loop autoplay preload="none" aria-label="Street Views video by ${escapeHtml(this.authorName())}"></video><button class="video-play-button" type="button" data-toggle-video-play aria-label="Pause video">Ⅱ</button><button class="video-sound-button" type="button" data-toggle-video-sound aria-pressed="false" aria-label="Turn video sound on">${this.soundIcon(false)}</button><div class="street-video-overlay"><header class="street-post-head"><span class="street-avatar">${escapeHtml(this.authorName().slice(0, 1).toUpperCase())}</span><div class="street-author"><strong>${escapeHtml(this.authorName())}</strong><span>${escapeHtml(date)} · LOCAL ONLY</span></div><span class="audience-chip">${post.audience === 'public' ? 'PUBLIC INTENT' : 'FOLLOWERS INTENT'}</span><button class="delete-post" type="button" data-delete-post="${escapeHtml(post.id)}" aria-label="Delete local video preview">×</button></header><div class="street-video-caption">${post.body ? `<p>${escapeHtml(post.body).replace(/\n/g, '<br>')}</p>` : ''}${post.campus ? `<span>${escapeHtml(post.campus)}</span>` : ''}</div><span class="street-video-device-tag">VIDEO · SAVED ON THIS DEVICE</span></div></div></article>`;
    return `<article class="street-post"><header class="street-post-head"><span class="street-avatar">${escapeHtml(this.authorName().slice(0, 1).toUpperCase())}</span><div class="street-author"><strong>${escapeHtml(this.authorName())}</strong><span>${escapeHtml(date)} · LOCAL ONLY</span></div><span class="audience-chip">${post.audience === 'public' ? 'PUBLIC INTENT' : 'FOLLOWERS INTENT'}</span><button class="delete-post" type="button" data-delete-post="${escapeHtml(post.id)}" aria-label="Delete local post preview">×</button></header><p class="street-post-copy">${escapeHtml(post.body).replace(/\n/g, '<br>')}</p>${post.campus ? `<p class="street-campus-tag">${escapeHtml(post.campus)}</p>` : ''}${image}<footer class="street-post-foot"><span>PREVIEW ON THIS DEVICE · NOT SHARED</span><span>${post.body.length} characters</span></footer></article>`;
  }

  private soundIcon(on: boolean): string { return on ? '♫' : '♪×'; }

  private render(): void {
    this.clearObjectUrls();
    const posts = this.visiblePosts();
    const author = this.authorName();
    if (this.pendingMedia) this.mediaUrl = this.createImageUrl(this.pendingMedia);
    const previewMedia = this.pendingMedia ? `<div class="attachment-preview">${this.pendingMedia.type.startsWith('video/') ? `<video src="${this.mediaUrl ?? ''}" muted playsinline controls></video>` : `<img src="${this.mediaUrl ?? ''}" alt="Selected image preview">`}<div><strong>${escapeHtml(this.pendingMedia.name)}</strong><span>${(this.pendingMedia.size / (1024 * 1024)).toFixed(1)} MB · stays on this device</span></div><button type="button" data-clear-media aria-label="Remove selected media">×</button></div>` : '';
    const composer = this.composerOpen ? `<div class="street-composer-backdrop"><form class="street-composer" id="street-composer" role="dialog" aria-modal="true" aria-labelledby="street-composer-title"><div class="composer-intro"><span class="street-avatar">${escapeHtml(author.slice(0, 1).toUpperCase())}</span><div><strong id="street-composer-title">Post a video</strong><span>Your video preview stays in this browser.</span></div><button type="button" class="street-composer-close" id="street-composer-close" aria-label="Close video composer">×</button></div><label class="street-body-label" for="street-body"><span class="visually-hidden">Video caption</span><textarea id="street-body" name="body" rows="3" maxlength="5000" placeholder="Write a caption…" aria-describedby="street-compose-note">${escapeHtml(this.draftBody)}</textarea></label><div class="street-compose-options"><label>Audience<select name="audience"><option value="public" ${this.draftAudience === 'public' ? 'selected' : ''}>Public</option><option value="followers" ${this.draftAudience === 'followers' ? 'selected' : ''}>Followers</option></select></label><label>Campus tag <input name="campus" maxlength="80" placeholder="Optional campus or community" value="${escapeHtml(this.draftCampus)}"></label></div>${previewMedia}<div class="street-compose-actions"><label class="media-picker">＋ Choose a video<input id="street-media" type="file" accept="video/mp4,video/webm" hidden></label><span id="street-character-count">${this.draftBody.length} / 5000</span><button class="street-submit" type="submit" ${this.error || this.loading || this.saving ? 'disabled' : ''}>Save video</button></div><p class="street-compose-note" id="street-compose-note">MP4 and WEBM up to 100 MB. Video stays on this device; nothing is published or synced.</p></form></div>` : '';
    const filterButtons: Array<[typeof this.filter, string]> = [['all','For you'],['followers','Following']];
    this.root.innerHTML = `<section class="views-overlay tiktok-feed" aria-labelledby="views-title">
      <header class="views-header"><div><button class="views-back" id="views-back" type="button" aria-label="Back to chats">← <span>Back to chats</span></button><p class="eyebrow">STREET VIEWS</p><h1 id="views-title">For you</h1></div><div class="views-header-actions"><span class="views-status"><i></i> DEVICE ONLY</span><button class="views-create" id="toggle-street-composer" type="button" aria-label="Post a video">＋ Post a video</button></div></header>
      <div class="views-content"><div class="views-feed-column">${composer}<div class="street-filters" role="group" aria-label="Video feed">${filterButtons.map(([filter,label]) => `<button type="button" data-filter="${filter}" class="${this.filter === filter ? 'is-active' : ''}">${label}</button>`).join('')}</div>
        <div class="street-post-list has-video-posts" aria-live="polite">${this.error ? `<div class="street-empty street-error"><span>!</span><h3>Videos unavailable</h3><p>${escapeHtml(this.error)}</p><button type="button" data-retry>Try again</button></div>` : this.loading ? `<div class="street-empty"><span class="feed-loader"></span><h3>Loading your feed</h3><p>Getting your next videos ready.</p></div>` : posts.length ? posts.map((post) => this.renderPost(post)).join('') : `<div class="street-empty"><span class="feed-play-mark">▶</span><h3>Your next scroll starts here.</h3><p>Post a short video and make this space yours.</p><button type="button" id="empty-create-post">＋ &nbsp; Post your first video</button></div>`}</div></div>
        <aside class="views-side"><div class="views-side-mark">▶</div><p class="eyebrow">STREET VIEWS</p><h2>Scroll into the moment.</h2><p>A vertical video feed. Video previews stay in this browser.</p><div class="views-side-divider"></div><span>MP4 · WEBM · UP TO 100 MB</span><span>LOCAL PREVIEW · NOT PUBLISHED</span></aside></div>
    </section>`;
    const textarea = this.root.querySelector<HTMLTextAreaElement>('#street-body');
    const count = this.root.querySelector<HTMLElement>('#street-character-count');
    if (textarea && count) count.textContent = `${textarea.value.length} / 5000`;
    const list = this.root.querySelector<HTMLElement>('.street-post-list');
    const videos = Array.from(this.root.querySelectorAll<HTMLVideoElement>('.street-video-stage video'));
    videos.forEach((video) => video.addEventListener('volumechange', () => {
      const button = video.closest('.street-video-stage')?.querySelector<HTMLButtonElement>('[data-toggle-video-sound]');
      if (button) { button.setAttribute('aria-pressed', String(!video.muted)); button.setAttribute('aria-label', video.muted ? 'Turn video sound on' : 'Mute video'); button.textContent = this.soundIcon(!video.muted); }
    }));
    videos.forEach((video) => video.addEventListener('play', () => { const button = video.closest('.street-video-stage')?.querySelector<HTMLButtonElement>('[data-toggle-video-play]'); if (button) { button.textContent = 'Ⅱ'; button.setAttribute('aria-label', 'Pause video'); } }));
    videos.forEach((video) => video.addEventListener('pause', () => { const button = video.closest('.street-video-stage')?.querySelector<HTMLButtonElement>('[data-toggle-video-play]'); if (button) { button.textContent = '▶'; button.setAttribute('aria-label', 'Play video'); } }));
    if (videos.length && 'IntersectionObserver' in window && list) {
      this.videoObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting && entry.intersectionRatio >= .65) void video.play().catch(() => undefined);
        else video.pause();
      }), { root: list, threshold: [.1, .65, .9] });
      videos.forEach((video) => this.videoObserver?.observe(video));
    }
  }

  private onClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target : null;
    if (this.composerOpen && target && !target.closest('.street-composer, #toggle-street-composer, #empty-create-post')) {
      this.composerOpen = false;
      this.root.querySelector('.street-composer-backdrop')?.remove();
    }
    if (target?.closest('#views-back')) { this.onBack(); return; }
    if (target?.closest('#toggle-street-composer, #empty-create-post')) {
      this.composerOpen = !this.composerOpen;
      this.render();
      if (this.composerOpen) this.root.querySelector<HTMLTextAreaElement>('#street-body')?.focus();
      return;
    }
    if (target?.closest('#street-composer-close')) {
      this.composerOpen = false;
      this.root.querySelector('.street-composer-backdrop')?.remove();
      this.root.querySelector<HTMLButtonElement>('#toggle-street-composer')?.focus();
      return;
    }
    const soundButton = target?.closest<HTMLButtonElement>('[data-toggle-video-sound]');
    if (soundButton) {
      const video = soundButton.closest('.street-video-stage')?.querySelector('video');
      if (video) { video.muted = !video.muted; soundButton.setAttribute('aria-pressed', String(!video.muted)); soundButton.setAttribute('aria-label', video.muted ? 'Turn video sound on' : 'Mute video'); soundButton.textContent = this.soundIcon(!video.muted); }
      return;
    }
    const playButton = target?.closest<HTMLButtonElement>('[data-toggle-video-play]');
    if (playButton) {
      const video = playButton.closest('.street-video-stage')?.querySelector('video');
      if (video) { if (video.paused) void video.play().catch(() => undefined); else video.pause(); }
      return;
    }
    const filter = target?.closest<HTMLButtonElement>('[data-filter]')?.dataset.filter;
    if (filter === 'all' || filter === 'public' || filter === 'followers') {
      this.filter = filter;
      this.render();
      return;
    }
    const deleteId = target?.closest<HTMLButtonElement>('[data-delete-post]')?.dataset.deletePost;
    if (deleteId) {
      void this.remove(deleteId).then(() => {
        this.posts = this.posts.filter((post) => post.id !== deleteId);
        this.render();
        this.announce('Local post preview deleted from this device.');
      }).catch(() => this.announce('Could not delete that local preview.'));
    }
    if (target?.closest('[data-clear-media]')) {
      this.pendingMedia = null;
      this.mediaUrl = null;
      this.composerOpen = false;
      this.render();
    }
    if (target?.closest('[data-retry]')) { this.loading = true; this.error = ''; this.render(); void this.load(); }
  };

  private onChange = (event: Event): void => {
    const target = event.target;
    if (target instanceof HTMLSelectElement && target.name === 'audience') {
      this.draftAudience = target.value === 'followers' ? 'followers' : 'public';
      return;
    }
    if (target instanceof HTMLInputElement && target.name === 'campus') {
      this.draftCampus = target.value;
      return;
    }
    if (!(target instanceof HTMLInputElement) || target.id !== 'street-media') return;
    const file = target.files?.[0] ?? null;
    if (!file) return;
    const isVideo = allowedVideoTypes.has(file.type);
    if (!isVideo) { this.announce('Street Views accepts MP4 and WEBM videos only.'); target.value = ''; return; }
    if (isVideo && file.size > maxVideoBytes) { this.announce('Videos must be 100 MB or smaller.'); target.value = ''; return; }
    this.pendingMedia = file;
    this.render();
  };

  private onInput = (event: Event): void => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement && target.id === 'street-body') {
      this.draftBody = target.value;
      const count = this.root.querySelector<HTMLElement>('#street-character-count');
      if (count) count.textContent = `${target.value.length} / 5000`;
    }
    if (target instanceof HTMLInputElement && target.name === 'campus') this.draftCampus = target.value;
  };

  private onSubmit = (event: Event): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'street-composer' || this.saving || this.loading || this.error) return;
    event.preventDefault();
    const data = new FormData(form);
    const body = String(data.get('body') ?? '').trim();
    if (!this.pendingMedia || !allowedVideoTypes.has(this.pendingMedia.type)) { this.announce('Choose an MP4 or WEBM video to post.'); return; }
    const post: LocalPost = {
      id: crypto.randomUUID(),
      body,
      audience: data.get('audience') === 'followers' ? 'followers' : 'public',
      campus: String(data.get('campus') ?? '').trim().slice(0, 80),
      createdAt: new Date().toISOString(),
      media: this.pendingMedia,
      mediaType: this.pendingMedia?.type.startsWith('video/') ? 'video' : this.pendingMedia ? 'image' : 'text',
      imageName: this.pendingMedia?.name ?? '',
    };
    const submit = form.querySelector<HTMLButtonElement>('.street-submit');
    this.saving = true;
    if (submit) submit.disabled = true;
    void this.save(post).then(() => {
      this.posts = [post, ...this.posts];
      this.pendingMedia = null;
      this.mediaUrl = null;
      this.draftBody = '';
      this.draftCampus = '';
      this.draftAudience = 'public';
      this.filter = 'all';
      this.error = '';
      this.saving = false;
      this.loading = false;
      this.render();
      this.announce('Post preview saved on this device. It was not shared.');
    }).catch((error: unknown) => {
      this.saving = false;
      this.render();
      if (submit) submit.disabled = false;
      this.announce(error instanceof Error ? error.message : 'Could not save the local post preview.');
    });
  };
}

export function mountStreetViews(root: HTMLElement, announce: (message: string) => void, onBack: () => void): () => void {
  const screen = new StreetViewsScreen(root, announce, onBack);
  return () => screen.destroy();
}
