import './style.css';
import type { ClassroomSetup, RoomStyle } from './game/campus-game';

type Section = 'Chats' | 'Street Views' | 'Campus Life' | 'The Yard' | 'Communities' | 'Crews' | 'Quests' | 'Notifications' | 'Profile' | 'Settings';
type PreviewMessage = { id: string; text: string; time: string; from: 'you' | 'sample'; replyTo?: string; reaction?: string; attachment?: { name: string; type: string; dataUrl: string } };
type PreviewConversation = { id: string; name: string; initials: string; kind: 'direct' | 'group'; campus: string; members?: string[]; archived: boolean; muted: boolean; pinned: boolean; unread: number; messages: PreviewMessage[] };
type PreviewRequest = { id: string; name: string; initials: string; campus: string; note: string };
type LocalProfile = { name: string; username: string; campus: string; bio: string; avatarDataUrl?: string };
type GifSearchResult = { id: string; title: string; url: string; preview: string };

const navItems: { label: Section; icon: string }[] = [
  { label: 'Chats', icon: 'message' }, { label: 'Street Views', icon: 'street-s' },
  { label: 'Campus Life', icon: 'campus' }, { label: 'The Yard', icon: 'compass' },
  { label: 'Communities', icon: 'people' }, { label: 'Crews', icon: 'flag' },
  { label: 'Quests', icon: 'bolt' }, { label: 'Notifications', icon: 'bell' },
];

const previewKey = 'ghetto-app-preview-messages-v1';
const conversationsKey = 'ghetto-app-local-conversations-v1';
const requestsKey = 'ghetto-app-local-message-requests-v1';
const profileKey = 'ghetto-app-local-profile-v1';
const classroomKey = 'ghetto-app-local-classroom-v1';
let activeSection: Section = 'Chats';
let messages: PreviewMessage[] = loadPreviewMessages();
let conversations: PreviewConversation[] = loadConversations();
let requests: PreviewRequest[] = loadRequests();
let activeConversationId = conversations[0]?.id ?? 'maya';
let chatView: 'inbox' | 'requests' | 'archived' = 'inbox';
let chatFilter: 'all' | 'unread' | 'groups' = 'all';
let showChatDetails = false;
let replyMessageId: string | null = null;
let chatQuery = '';
let pendingAttachment: PreviewMessage['attachment'] | undefined;
let emojiPickerOpen = false;
let gifPickerOpen = false;
let gifSearch = '';
let giphyApiKey = (() => { try { return localStorage.getItem('ghetto-app-giphy-key') ?? ''; } catch { return ''; } })();
let gifResults: GifSearchResult[] = [];
let gifLoading = false;
let gifError = '';
let gifSearchTimer = 0;
let gifRequestId = 0;
let emojiCategory = 'Faces';
let emojiSearch = '';
let profilePhotoDraft: string | null = null;
let localProfile: LocalProfile = loadLocalProfile();
let activePane: 'inbox' | 'conversation' = 'inbox';
let destroyCampusGame: (() => void) | null = null;
let destroyStreetViews: (() => void) | null = null;
let classroomSetup = loadClassroomSetup();

function loadClassroomSetup(): ClassroomSetup {
  const fallback: ClassroomSetup = { name: 'The Yard Classroom', style: 'lecture', chairs: 12 };
  try {
    const value = JSON.parse(localStorage.getItem(classroomKey) ?? 'null') as Partial<ClassroomSetup> | null;
    return {
      name: typeof value?.name === 'string' ? value.name.slice(0, 42) : fallback.name,
      style: value?.style === 'studio' || value?.style === 'garden' ? value.style : 'lecture',
      chairs: Number.isFinite(value?.chairs) ? Math.max(2, Math.min(48, Math.floor(value!.chairs!))) : fallback.chairs,
    };
  } catch { return fallback; }
}

function loadLocalProfile(): LocalProfile {
  const empty: LocalProfile = { name: '', username: '', campus: '', bio: '' };
  try {
    const saved = localStorage.getItem(profileKey);
    const value = saved ? JSON.parse(saved) as Partial<LocalProfile> : {};
    const avatarDataUrl = typeof value.avatarDataUrl === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value.avatarDataUrl) && value.avatarDataUrl.length < 1_300_000 ? value.avatarDataUrl : undefined;
    return { name: typeof value.name === 'string' ? value.name.slice(0,48) : '', username: typeof value.username === 'string' ? value.username.slice(0,24) : '', campus: typeof value.campus === 'string' ? value.campus.slice(0,64) : '', bio: typeof value.bio === 'string' ? value.bio.slice(0,160) : '', avatarDataUrl };
  } catch { return empty; }
}

function loadPreviewMessages(): PreviewMessage[] {
  try {
    const stored = localStorage.getItem(previewKey);
    if (stored) {
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed)) {
        const safeMessages = parsed.filter((item): item is PreviewMessage => !!item && typeof item === 'object'
          && typeof item.id === 'string' && typeof item.text === 'string' && typeof item.time === 'string'
          && (item.from === 'you' || item.from === 'sample')).slice(-300).map((item) => ({
          id: item.id.slice(0, 80), text: item.text.slice(0, 5000), time: item.time.slice(0, 40), from: item.from,
        }));
        if (safeMessages.length) return safeMessages;
      }
    }
  } catch { /* Ignore invalid local preview data and show the sample conversation. */ }
  return [
    { id: 'sample-1', text: 'You dey come for the campus gist later?', time: '10:42', from: 'sample' },
    { id: 'sample-2', text: 'I go pull up after class ✨', time: '10:44', from: 'you' },
    { id: 'sample-3', text: 'Sharp. I saved you a seat by the courtyard.', time: '10:46', from: 'sample' },
  ];
}

function loadConversations(): PreviewConversation[] {
  const mayaMessages = loadPreviewMessages();
  const defaults: PreviewConversation[] = [
    { id: 'maya', name: 'Maya Okafor', initials: 'M', kind: 'direct', campus: 'University of Lagos', archived: false, muted: false, pinned: true, unread: 0, messages: mayaMessages },
    { id: 'studio', name: 'Design studio', initials: 'DS', kind: 'group', campus: 'Creative crew', members: ['You', 'Maya Okafor', 'Tobi Adebayo'], archived: false, muted: false, pinned: false, unread: 2, messages: [
      { id: 'studio-1', text: 'Are we still meeting by the arts block?', time: '09:18', from: 'sample' },
      { id: 'studio-2', text: 'Yes — I’ll bring the moodboards.', time: '09:21', from: 'you' },
      { id: 'studio-3', text: 'Perfect. I have a few new references to share.', time: '09:24', from: 'sample' },
    ] },
    { id: 'tobi', name: 'Tobi Adebayo', initials: 'T', kind: 'direct', campus: 'Lagos', archived: false, muted: false, pinned: false, unread: 1, messages: [
      { id: 'tobi-1', text: 'I found that food spot you mentioned 👀', time: 'Yesterday', from: 'sample' },
      { id: 'tobi-2', text: 'Send me the name when you can', time: 'Yesterday', from: 'you' },
    ] },
  ];
  try {
    const saved = localStorage.getItem(conversationsKey);
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as unknown;
    if (!Array.isArray(parsed)) return defaults;
    const safeConversations = parsed.filter((item): item is PreviewConversation => !!item && typeof item === 'object'
      && typeof item.id === 'string' && typeof item.name === 'string'
      && (item.kind === 'direct' || item.kind === 'group') && Array.isArray(item.messages))
      .slice(0, 50).map((item) => ({
        id: item.id.slice(0, 80), name: item.name.slice(0, 48), initials: typeof item.initials === 'string' ? item.initials.slice(0, 3) : '?',
        kind: item.kind, campus: typeof item.campus === 'string' ? item.campus.slice(0, 64) : '',
        ...(item.kind === 'group' ? { members: Array.isArray(item.members) ? item.members.filter((member): member is string => typeof member === 'string').slice(0, 100).map((member) => member.slice(0, 48)) : ['You'] } : {}),
        archived: item.archived === true, muted: item.muted === true, pinned: item.pinned === true,
        unread: Number.isFinite(item.unread) ? Math.max(0, Math.min(999, Math.floor(item.unread))) : 0,
        messages: item.messages.filter((message): message is PreviewMessage => !!message && typeof message === 'object'
          && typeof message.id === 'string' && typeof message.text === 'string' && typeof message.time === 'string'
          && (message.from === 'you' || message.from === 'sample')).slice(-300).map((message) => ({
          id: message.id.slice(0, 80), text: message.text.slice(0, 5000), time: message.time.slice(0, 40), from: message.from,
          ...(typeof message.replyTo === 'string' ? { replyTo: message.replyTo.slice(0, 80) } : {}),
          ...(typeof message.reaction === 'string' ? { reaction: message.reaction.slice(0, 8) } : {}),
          ...(message.attachment && typeof message.attachment.name === 'string' && typeof message.attachment.type === 'string' && typeof message.attachment.dataUrl === 'string'
            ? { attachment: { name: message.attachment.name.slice(0, 120), type: message.attachment.type.slice(0, 60), dataUrl: message.attachment.dataUrl.slice(0, 1_500_000) } } : {}),
        })),
      }));
    return safeConversations.length ? safeConversations : defaults;
  } catch { return defaults; }
}

function loadRequests(): PreviewRequest[] {
  const defaults: PreviewRequest[] = [
    { id: 'request-amina', name: 'Amina Yusuf', initials: 'A', campus: 'University of Lagos', note: 'Hey! I saw your campus design post and would love to connect.' },
    { id: 'request-kay', name: 'Kayode Bello', initials: 'K', campus: 'Yaba, Lagos', note: 'We might be in the same photography community.' },
  ];
  try {
    const saved = localStorage.getItem(requestsKey);
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is PreviewRequest => !!item && typeof item === 'object'
      && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.note === 'string').slice(0, 50).map((item) => ({
        id: item.id.slice(0, 80), name: item.name.slice(0, 48), initials: typeof item.initials === 'string' ? item.initials.slice(0, 3) : '?',
        campus: typeof item.campus === 'string' ? item.campus.slice(0, 64) : '', note: item.note.slice(0, 500),
      })) : defaults;
  } catch { return defaults; }
}

function saveConversations(): void { try { localStorage.setItem(conversationsKey, JSON.stringify(conversations)); } catch { announce('This browser could not save the chat preview. Try removing a large attachment.'); } }
function saveRequests(): void { try { localStorage.setItem(requestsKey, JSON.stringify(requests)); } catch { announce('This browser could not save the request preview.'); } }

function icon(name: string, size = 20): string {
  const paths: Record<string, string> = {
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/>',
    play: '<path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none"/>',
    campus: '<path d="m3 9 9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z"/><path d="M9 21v-8h6v8M3 9h18"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6"/>',
    flag: '<path d="M4 22V4m0 0c5-4 9 4 16 0v12c-7 4-11-4-16 0"/>',
    bolt: '<path d="m13 2-3 8H5l6 12 3-8h5L13 2Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
    moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    back: '<path d="m15 18-6-6 6-6M9 12h12"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    attach: '<path d="m21.4 11.6-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.8Z" transform="translate(-2 -2)"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.spark}</svg>`;
}

function currentTheme(): string {
  const saved = localStorage.getItem('ghetto-app-theme');
  return saved ?? 'light';
}

function render(): void {
  destroyCampusGame?.();
  destroyCampusGame = null;
  destroyStreetViews?.();
  destroyStreetViews = null;
  document.documentElement.dataset.theme = currentTheme();
  const app = document.querySelector<HTMLDivElement>('#app')!;
  const preview = activeSection === 'Chats';
  const profile = activeSection === 'Profile';
  const campus = activeSection === 'Campus Life';
  const streetViews = activeSection === 'Street Views';
  app.innerHTML = `
    <div class="app-shell">
      <aside class="rail" aria-label="Main navigation">
        <a class="brand-mark" href="#" aria-label="GHETTO APP home"><span class="brand-glyph">g</span><span class="brand-word">GHETTO<span>APP</span></span></a>
        <div class="rail-rule"></div>
        <nav class="rail-nav">${navItems.map((item) => `<button class="nav-item ${activeSection === item.label ? 'is-active' : ''}" data-section="${item.label}" aria-current="${activeSection === item.label ? 'page' : 'false'}"><span class="nav-icon">${item.icon === 'street-s' ? '<span class="street-s-mark" aria-hidden="true">S</span>' : icon(item.icon)}</span><span>${item.label}</span></button>`).join('')}</nav>
        <div class="rail-bottom"><button class="nav-item ${activeSection === 'Profile' ? 'is-active' : ''}" data-section="Profile">${avatarMarkup(localProfile.name?.[0] || 'Y','avatar avatar-you')}<span>My profile</span></button><button class="nav-item" id="theme-toggle" aria-label="Switch colour theme">${icon('moon')}<span>Appearance</span></button><div class="rail-caption">NIGHT CULTURE · PREVIEW</div></div>
      </aside>
      <main id="main" class="workspace ${activePane === 'conversation' ? 'show-conversation' : ''}">
        ${renderChatWorkspace()}
      </main>
      <nav class="mobile-nav" aria-label="Mobile navigation">${[['Chats','message'],['Street Views','street-s'],['Campus Life','campus'],['The Yard','compass'],['Profile','people']].map(([label, ico]) => `<button class="mobile-nav-item ${activeSection === label ? 'is-active' : ''}" data-section="${label}">${ico === 'street-s' ? '<span class="street-s-mark mobile-street-s" aria-hidden="true">S</span>' : icon(ico, 21)}<span>${label === 'Street Views' ? 'Views' : label === 'Campus Life' ? 'Campus' : label}</span></button>`).join('')}</nav>
    </div>
    ${profile ? renderProfilePage() : campus ? renderCampusScreen() : streetViews ? '<div id="street-views-root"></div>' : preview ? '' : `<div class="feature-overlay" role="status"><div class="feature-card"><span class="feature-icon">${icon(navItems.find((x) => x.label === activeSection)?.icon ?? 'settings', 24)}</span><p class="eyebrow">GHETTO APP · ROADMAP</p><h2>${escapeHtml(activeSection)}</h2><p>This space is planned for the next build phases. It will appear here once the real feature is ready.</p><button class="primary-button" id="return-chats">Back to chats</button></div></div>`}
  `;
  bindEvents();
  scrollMessagesToEnd();
  if (campus) mountCampusPreview();
  if (streetViews) mountStreetViewsPreview();
}

function mountStreetViewsPreview(): void {
  const root = document.querySelector<HTMLElement>('#street-views-root');
  if (!root) return;
  void import('./features/street-views').then(({ mountStreetViews }) => {
    if (!root.isConnected || activeSection !== 'Street Views') return;
    destroyStreetViews = mountStreetViews(root, announce, () => { activeSection = 'Chats'; render(); });
  }).catch(() => announce('Street Views could not open. Please try again.'));
}

function currentConversation(): PreviewConversation {
  return conversations.find((item) => item.id === activeConversationId) ?? conversations[0] ?? {
    id: 'empty', name: 'Your chats', initials: '✳', kind: 'direct', campus: '', archived: false, muted: false, pinned: false, unread: 0, messages: [],
  };
}

const emojiSets: Record<string, string[]> = {
  Faces: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😍','🥰','😘','😗','😋','😎','🤩','🥳','😭','😤','😮','😴','🤔','🙏','🤝','👏','🙌','👍','👎','❤️','🧡','💛','💚','💙','💜','🔥','✨','💯','🎉','👀','💀','🤍','🫶'],
  People: ['👋','🤚','✋','🖐️','👌','✌️','🤞','🤟','🤘','🤙','💪','🫡','🙋','🙌','🧍','🕺','💃','🧑‍🤝‍🧑','👶','🧑','👨','👩'],
  Nature: ['🐶','🐱','🐻','🦁','🐸','🐼','🐧','🦋','🌸','🌹','🌻','🌈','☀️','🌙','⭐','⚡','🔥','🌊','🍀','🌍'],
  Food: ['🍕','🍔','🍟','🌮','🍜','🍣','🍗','🥘','🍉','🍓','🍇','🥑','☕','🧋','🍹','🎂','🍩','🍿'],
  Activity: ['⚽','🏀','🏈','⚾','🎾','🏆','🎮','🎧','🎤','🎨','🎬','🎲','🎸','🎹','🏋️','🏃','🛹','🚴'],
  Travel: ['🚗','🚕','🚌','🚲','✈️','🚀','🏠','🏙️','🏖️','🌆','🗺️','⛺','🚦','🚇','🚂'],
  Objects: ['📱','💻','📷','💡','📚','✏️','💰','🎁','📦','🔑','🔒','💎','🛍️','🧢','👟','🕶️'],
  Symbols: ['❤️','💔','💖','💬','💭','✅','❌','⚠️','♻️','💤','💢','➕','➖','‼️','❓','🔴','🟢','🟣'],
};
function renderEmojiPicker(): string {
  const entries = Object.entries(emojiSets);
  const categoryTerms: Record<string,string> = { Faces: 'smile happy laugh love heart reaction cry angry cool', People: 'person hand wave gesture thumbs family', Nature: 'animal flower plant weather sky', Food: 'meal drink fruit dessert', Activity: 'sport music game art', Travel: 'car place city transport', Objects: 'phone tool money clothes', Symbols: 'heart sign check warning question' };
  const buttons = entries.map(([category]) => `<button type="button" data-emoji-category="${category}" class="emoji-category ${emojiCategory === category ? 'is-active' : ''}">${category}</button>`).join('');
  const visible = emojiSearch ? entries.flatMap(([category, emojis]) => emojis.map((emoji) => ({emoji,category}))) : (emojiSets[emojiCategory] ?? emojiSets.Faces).map((emoji) => ({emoji,category:emojiCategory}));
  const filtered = emojiSearch ? visible.filter(({emoji,category}) => `${emoji} ${category} ${categoryTerms[category] ?? ''}`.toLowerCase().includes(emojiSearch.toLowerCase())) : visible;
  return `<section class="emoji-picker" aria-label="Emoji picker"><div class="emoji-picker-head"><strong>Choose emoji</strong><button type="button" id="close-emoji-picker" aria-label="Close emoji picker">×</button></div><input id="emoji-search" type="search" placeholder="Search emoji" value="${escapeHtml(emojiSearch)}" aria-label="Search emoji"><div class="emoji-categories" role="tablist" aria-label="Emoji categories">${buttons}</div><div class="emoji-grid">${filtered.map(({emoji,category}) => `<button type="button" data-insert-emoji="${emoji}" data-emoji-search="${category} ${categoryTerms[category] ?? ''}" aria-label="Insert ${category} emoji">${emoji}</button>`).join('') || '<small>No emoji found</small>'}</div></section>`;
}

function renderGifPicker(): string {
  const seen = new Set<string>();
  const recent = conversations.flatMap((conversation) => conversation.messages).filter((message) => message.attachment?.type === 'image/gif' && !!safeAttachmentUrl(message.attachment.dataUrl, 'image/gif'))
    .reverse().filter((message) => { const key = message.attachment?.dataUrl ?? ''; if (!key || seen.has(key)) return false; seen.add(key); return true; }).slice(0, 20)
    .filter((message) => !gifSearch || message.attachment!.name.toLowerCase().includes(gifSearch.toLowerCase()));
  const results = gifResults.map((gif) => `<button type="button" class="gif-result" data-select-online-gif="${escapeHtml(gif.id)}" title="Use ${escapeHtml(gif.title)}"><img src="${escapeHtml(gif.preview)}" alt="${escapeHtml(gif.title)}" loading="lazy"></button>`).join('');
  const recentGrid = recent.map((message) => `<button type="button" class="gif-result" data-select-gif="${escapeHtml(message.id)}" title="Use ${escapeHtml(message.attachment!.name)}"><img src="${escapeHtml(safeAttachmentUrl(message.attachment!.dataUrl,'image/gif'))}" alt="GIF: ${escapeHtml(message.attachment!.name)}" loading="lazy"></button>`).join('');
  const keySetup = !giphyApiKey ? `<div class="gif-key-setup"><strong>Turn on GIF search</strong><small>Connect a GIPHY API key to search and browse trending GIFs. Your key is saved only in this browser.</small><div><input id="giphy-key-input" type="password" autocomplete="off" placeholder="Paste your GIPHY API key" aria-label="GIPHY API key"><button type="button" id="save-giphy-key">Connect</button></div><a href="https://developers.giphy.com/dashboard/" target="_blank" rel="noreferrer">Get a GIPHY API key ↗</a></div>` : '';
  const mainContent = gifLoading ? '<div class="gif-status">Finding GIFs…</div>' : gifError ? `<div class="gif-status gif-error">${escapeHtml(gifError)}</div>` : results || (giphyApiKey ? '<div class="gif-status">No GIFs found. Try another search.</div>' : keySetup);
  return `<section class="gif-picker" aria-label="GIF picker"><header class="gif-picker-head"><div><span class="gif-picker-label">GHETTO GIFS</span><strong>Find a reaction</strong></div><button type="button" id="close-gif-picker" aria-label="Close GIF picker">×</button></header><label class="gif-search">${icon('search',16)}<input id="gif-search-input" type="search" placeholder="Search GIFs" value="${escapeHtml(gifSearch)}" aria-label="Search GIFs"></label>${gifSearch ? '' : '<div class="gif-trending-label">TRENDING</div>'}<div class="gif-picker-results">${mainContent}</div>${recentGrid ? `<div class="gif-recent-title">YOUR RECENT GIFS</div><div class="gif-picker-results gif-recent-grid">${recentGrid}</div>` : ''}<footer class="gif-picker-foot"><span>${giphyApiKey ? 'Powered by GIPHY · GIFs stay in this chat preview' : 'GIFs you attach are saved on this device'}</span><button type="button" id="gif-upload-footer">＋ Add GIF</button></footer></section>`;
}

function renderChatWorkspace(): string {
  const conversation = currentConversation();
  const query = chatQuery.trim().toLowerCase();
  const visible = conversations.filter((item) => chatView === 'archived' ? item.archived : !item.archived)
    .filter((item) => chatFilter === 'unread' ? item.unread > 0 : chatFilter === 'groups' ? item.kind === 'group' : true)
    .filter((item) => !query || `${item.name} ${item.campus} ${item.messages.map((message) => message.text).join(' ')}`.toLowerCase().includes(query))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const listTitle = chatView === 'requests' ? 'Message requests' : chatView === 'archived' ? 'Archived chats' : 'Your conversations';
  const inboxContent = chatView === 'requests' ? renderRequestList() : visible.length
    ? visible.map((item) => renderConversationRow(item)).join('')
    : `<div class="chat-list-empty"><span>✳</span><strong>${query ? 'No matching chats' : chatView === 'archived' ? 'Nothing archived yet' : 'No chats in this filter'}</strong><small>${query ? 'Try a name or a word from a message.' : 'Start a new chat preview to see it here.'}</small></div>`;
  return `<section class="inbox-panel ${activePane === 'conversation' ? 'inbox-hidden-mobile' : ''}" aria-label="Messages">
      <div class="inbox-heading"><div><p class="eyebrow">YOUR PEOPLE</p><h1>Chats</h1></div><div class="heading-actions"><button class="icon-button theme-mobile" id="theme-toggle-mobile" aria-label="Switch colour theme">${icon('moon')}</button><button class="icon-button" id="new-chat" aria-label="Start a new chat" title="New chat">${icon('plus')}</button></div></div>
      <label class="search-box">${icon('search')}<input id="chat-search" type="search" placeholder="Search chats or messages" aria-label="Search chats or messages" value="${escapeHtml(chatQuery)}"></label>
      ${requests.length ? `<button class="requests-row ${chatView === 'requests' ? 'is-selected' : ''}" id="show-requests" type="button"><span class="request-icon">${icon('message', 18)}</span><span><strong>Message requests</strong><small>${requests.length} waiting · people outside your chats</small></span><b class="unread-pill">${requests.length}</b><span class="chevron">›</span></button>` : chatView === 'requests' ? '<button class="requests-row" id="back-to-chat-inbox" type="button">‹ &nbsp; Back to chats</button>' : ''}
      <div class="chat-filter-row" role="group" aria-label="Filter chats"><button type="button" data-chat-filter="all" class="${chatFilter === 'all' ? 'is-active' : ''}">All</button><button type="button" data-chat-filter="unread" class="${chatFilter === 'unread' ? 'is-active' : ''}">Unread</button><button type="button" data-chat-filter="groups" class="${chatFilter === 'groups' ? 'is-active' : ''}">Groups</button><button type="button" id="show-archived" class="archive-shortcut ${chatView === 'archived' ? 'is-active' : ''}">Archived</button></div>
      <div class="list-label">${escapeHtml(listTitle).toUpperCase()}</div>
      <div class="chat-list" id="chat-list">${inboxContent}</div>
      <div class="inbox-footer">Private chats stay personal.<br><span>Preview messages are saved only in this browser.</span></div>
    </section>
    <section class="conversation-panel ${activePane === 'conversation' ? 'conversation-visible-mobile' : ''}" aria-label="Conversation">
      <header class="conversation-header"><button class="back-button" id="back-to-inbox" aria-label="Back to chats">${icon('back')}</button><span class="avatar avatar-maya avatar-small">${escapeHtml(conversation.initials)}</span><div class="person-title"><strong>${escapeHtml(conversation.name)} <i class="preview-tag">${conversation.kind === 'group' ? 'GROUP' : 'PREVIEW'}</i></strong><span>${escapeHtml(conversation.kind === 'group' ? conversation.campus || 'Local group preview' : conversation.campus || 'Local chat preview')}</span></div><button class="icon-button header-more" id="conversation-menu" aria-label="Conversation details">${icon('more')}</button></header>
      <div class="local-banner"><span class="local-dot"></span><span><strong>Device-only preview</strong> · not delivered, synced, or end-to-end encrypted.</span></div>
      <div class="message-date">${conversation.kind === 'group' ? 'GROUP PREVIEW' : 'PRIVATE CHAT PREVIEW'} · ONLY YOU CAN SEE THIS</div>
      <div class="message-list" id="message-list">${conversation.messages.map((message) => renderConversationMessage(message, conversation)).join('')}</div>
      ${replyMessageId ? `<div class="replying-to"><span>Replying to ${escapeHtml(conversation.messages.find((message) => message.id === replyMessageId)?.from === 'you' ? 'your message' : conversation.name)}</span><button type="button" id="cancel-reply" aria-label="Cancel reply">×</button></div>` : ''}
      ${pendingAttachment ? `<div class="attachment-draft">${pendingAttachment.type.startsWith('image/') ? `<img src="${escapeHtml(pendingAttachment.dataUrl)}" alt="Selected attachment">` : '<span class="attachment-file-icon">↗</span>'}<span><strong>${escapeHtml(pendingAttachment.name)}</strong><small>Ready to add to your message</small></span><button type="button" id="remove-pending-attachment" aria-label="Remove attachment">×</button></div>` : ''}<form class="composer" id="composer"><button class="composer-tool" type="button" id="attach-button" aria-label="Attach a file" title="Attach">${icon('attach')}</button><input id="chat-attachment-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain" hidden><input id="gif-file-input" type="file" accept="image/gif" hidden><textarea id="message-input" maxlength="5000" rows="1" autocomplete="off" placeholder="Message" aria-label="Write a message"></textarea><button class="composer-tool gif-button" type="button" id="gif-button" aria-label="Choose a GIF" aria-expanded="${gifPickerOpen}">GIF</button><button class="composer-tool emoji-button" type="button" id="emoji-button" aria-label="Choose emoji" aria-expanded="${emojiPickerOpen}">${icon('smile')}</button><button class="send-button" type="submit" aria-label="Save local message preview">${icon('send')}</button></form>${emojiPickerOpen ? renderEmojiPicker() : ''}${gifPickerOpen ? renderGifPicker() : ''}
      <div class="composer-hint">Local preview only · your text is not sent to anyone.</div>
      ${showChatDetails ? renderChatDetails(conversation) : ''}
    </section>
    <aside class="context-panel"><div class="context-top"><span class="context-label">NIGHT CULTURE</span><span class="context-orbit">✳</span></div><div class="context-card"><div class="context-art"><div class="art-orb orb-one"></div><div class="art-orb orb-two"></div><span class="art-glyph">g</span><span class="art-spark">✦</span></div><div class="context-copy"><p class="eyebrow">A NEW KIND OF SOCIAL</p><h2>Your people.<br>Your world.</h2><p>Chat privately. Share publicly. Meet in Campus Life.</p><span class="coming-label"><span></span>Building the foundation</span></div></div><div class="context-bottom"><span>GHETTO APP</span><span>BUILT FOR YOUR WORLD ↗</span></div></aside>
    ${renderNewChatDialog()}`;
}

function renderConversationRow(item: PreviewConversation): string {
  const lastMessage = item.messages.at(-1)?.text ?? 'Start the conversation';
  const selected = item.id === activeConversationId && activePane === 'conversation';
  return `<article class="chat-row ${selected ? 'is-selected' : ''} ${item.unread ? 'has-unread' : ''}" data-chat-row="${escapeHtml(item.id)}"><button type="button" class="chat-open" data-open-chat="${escapeHtml(item.id)}"><span class="avatar avatar-maya">${escapeHtml(item.initials)}</span><span class="chat-summary"><span class="chat-name">${escapeHtml(item.name)} ${item.kind === 'group' ? '<i class="preview-tag">GROUP</i>' : ''} ${item.muted ? '<i class="preview-tag">MUTED</i>' : ''}</span><span class="chat-snippet">${escapeHtml(lastMessage)}</span></span><span class="chat-row-meta"><span class="chat-time">${escapeHtml(item.messages.at(-1)?.time ?? '')}</span>${item.unread ? `<b class="unread-pill">${item.unread}</b>` : ''}</span></button><button type="button" class="chat-row-menu" data-archive-chat="${escapeHtml(item.id)}" aria-label="${item.archived ? 'Restore' : 'Archive'} ${escapeHtml(item.name)}" title="${item.archived ? 'Restore chat' : 'Archive chat'}">${item.archived ? '↩' : '↓'}</button></article>`;
}

function renderRequestList(): string {
  const query = chatQuery.trim().toLowerCase();
  const filtered = requests.filter((request) => !query || `${request.name} ${request.campus} ${request.note}`.toLowerCase().includes(query));
  return filtered.length ? `<div class="request-list">${filtered.map((request) => `<article class="request-card" data-request-card><div class="request-card-head"><span class="avatar avatar-maya">${escapeHtml(request.initials)}</span><div><strong>${escapeHtml(request.name)}</strong><small>${escapeHtml(request.campus)} · request preview</small></div></div><p>${escapeHtml(request.note)}</p><div class="request-actions"><button type="button" data-decline-request="${escapeHtml(request.id)}">Delete</button><button type="button" data-accept-request="${escapeHtml(request.id)}">Accept</button></div></article>`).join('')}<p class="request-disclaimer">Request controls are a local preview. They do not contact or notify anyone.</p></div>` : `<div class="chat-list-empty"><span>✳</span><strong>${requests.length ? 'No matching requests' : 'All caught up'}</strong><small>${requests.length ? 'Try another name or campus.' : 'New requests will appear here.'}</small></div>`;
}

function renderConversationMessage(message: PreviewMessage, conversation: PreviewConversation): string {
  const replied = message.replyTo ? conversation.messages.find((item) => item.id === message.replyTo) : null;
  const attachmentUrl = message.attachment ? safeAttachmentUrl(message.attachment.dataUrl, message.attachment.type) : '';
  const attachment = message.attachment && attachmentUrl ? (message.attachment.type.startsWith('image/')
    ? `<a class="chat-attachment" href="${escapeHtml(attachmentUrl)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(attachmentUrl)}" alt="${escapeHtml(message.attachment.name)}"><span>${escapeHtml(message.attachment.name)} · local image</span></a>`
    : `<a class="chat-attachment-file" href="${escapeHtml(attachmentUrl)}" download="${escapeHtml(message.attachment.name)}">↧ ${escapeHtml(message.attachment.name)}</a>`) : '';
  return `<article class="message-row ${message.from === 'you' ? 'message-outgoing' : 'message-incoming'}" data-message-row="${escapeHtml(message.id)}"><div class="message-bubble">${replied ? `<div class="quoted-message">${escapeHtml(replied.from === 'you' ? 'You' : conversation.name)}: ${escapeHtml(replied.text)}</div>` : ''}${attachment}${escapeHtml(message.text).replace(/\n/g, '<br>')}<div class="message-meta"><time>${escapeHtml(message.time)}</time>${message.from === 'you' ? '<span aria-label="saved on this device">✓</span>' : ''}</div>${message.reaction ? `<span class="message-reaction">${escapeHtml(message.reaction)}</span>` : ''}</div><div class="message-actions"><button type="button" data-reply-message="${escapeHtml(message.id)}" aria-label="Reply to message">↩</button><button type="button" data-react-message="${escapeHtml(message.id)}" aria-label="React to message">☺</button></div></article>`;
}

function safeAttachmentUrl(value: string, type: string): string {
  const allowed = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']);
  if (type === 'image/gif' && isGiphyGifUrl(value)) return value;
  const escapedType = type.replace('/', '\\/');
  return allowed.has(type) && new RegExp(`^data:${escapedType};base64,[a-z0-9+/=]+$`, 'i').test(value) ? value : '';
}

function renderChatDetails(conversation: PreviewConversation): string {
  const groupMembers = conversation.members ?? [];
  const addable = conversations.filter((item) => item.kind === 'direct' && !groupMembers.includes(item.name));
  const members = conversation.kind === 'group' ? `<div class="group-members"><strong>Members · ${groupMembers.length}</strong>${groupMembers.map((member) => `<span>${escapeHtml(member)} <small>${member === 'You' ? 'HOST' : 'PREVIEW MEMBER'}</small>${member !== 'You' ? `<button type="button" data-remove-group-member="${escapeHtml(member)}" aria-label="Remove ${escapeHtml(member)}">×</button>` : ''}</span>`).join('')}${addable.length ? `<div class="add-group-member"><select id="add-group-member" aria-label="Choose a preview member"><option value="">Add a member</option>${addable.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('')}</select><button type="button" id="add-group-member-button">Add</button></div>` : ''}</div>` : '';
  return `<aside class="chat-details" aria-label="Chat details"><div class="chat-details-head"><strong>Chat details</strong><button type="button" id="close-chat-details" aria-label="Close details">×</button></div><div class="chat-details-person"><span class="avatar">${escapeHtml(conversation.initials)}</span><strong>${escapeHtml(conversation.name)}</strong><small>${escapeHtml(conversation.kind === 'group' ? conversation.campus || 'Local preview group' : conversation.campus || 'Local preview')}</small></div>${members}<div class="chat-details-actions"><button type="button" id="toggle-mute">${conversation.muted ? 'Unmute notifications' : 'Mute notifications'}</button><button type="button" id="toggle-pin">${conversation.pinned ? 'Unpin chat' : 'Pin chat'}</button><button type="button" id="archive-active-chat">${conversation.archived ? 'Unarchive chat' : 'Archive chat'}</button></div><p>Shared media and real contact information will be available after account and secure messaging setup.</p></aside>`;
}

function renderNewChatDialog(): string {
  const contacts = conversations.filter((item) => item.kind === 'direct' && !item.archived);
  return `<div class="chat-modal" id="new-chat-modal" hidden><form class="chat-modal-card" id="new-chat-form"><button class="chat-modal-close" type="button" id="close-new-chat" aria-label="Close">×</button><p class="eyebrow">CHAT PREVIEW</p><h2>Start a conversation</h2><p>This creates a private preview on this device only.</p><label>Chat type<select name="kind" id="new-chat-kind"><option value="direct">One-to-one</option><option value="group">Group</option></select></label><label>Person or group name<input name="name" maxlength="48" required placeholder="Name or group title"></label><label>Campus or context <span class="optional">OPTIONAL</span><input name="campus" maxlength="64" placeholder="Campus, class, crew…"></label><fieldset class="member-picker" id="member-picker" hidden><legend>Choose preview members</legend>${contacts.map((item) => `<label><input type="checkbox" name="members" value="${escapeHtml(item.id)}"><span>${escapeHtml(item.name)}</span></label>`).join('')}<small>These are local sample conversations, not registered contacts.</small></fieldset><button class="primary-button" type="submit">Create chat preview</button></form></div>`;
}

function renderCampusScreen(): string {
  return `<section class="campus-overlay" aria-labelledby="campus-title">
    <header class="campus-header"><button class="profile-back" id="campus-back">${icon('back', 18)}<span>Back to chats</span></button><div class="profile-header-mark"><span class="brand-glyph">g</span><span>GHETTO APP</span></div><span class="solo-badge"><i></i> SOLO PREVIEW</span></header>
    <div class="campus-content"><div class="campus-heading"><div><p class="eyebrow">CAMPUS LIFE · FIRST WALK</p><h1 id="campus-title">Find your way<br>around the Yard.</h1></div><div class="campus-location"><span class="location-dot"></span><span id="campus-location" aria-live="polite">ON CAMPUS · SOLO</span></div></div>
      <div class="campus-layout"><div class="game-frame"><div class="game-topline"><span>THE YARD <b>·</b> 360° FIRST-PERSON VIEW</span><span id="game-hint">W TO WALK · A/D TO TURN · DRAG TO LOOK · E TO ENTER</span></div><div class="game-stage" id="campus-game" role="img" aria-label="First-person 2D campus experience with a full 360 degree view. Use W and S to walk, A and D to turn, or drag to look around."></div><button class="room-action" id="room-action" type="button" disabled>Walk up to a room to enter</button><div class="touch-pad" aria-label="First-person movement controls"><button data-direction="up" aria-label="Walk forward">↑</button><button data-direction="left" aria-label="Turn left">↶</button><button data-direction="down" aria-label="Walk backward">↓</button><button data-direction="right" aria-label="Turn right">↷</button></div></div>
      <aside class="campus-aside"><div class="aside-kicker"><span>YOU’RE HERE</span><span>01 / SOLO</span></div><div class="campus-avatar">${localProfile.name ? escapeHtml(localProfile.name.slice(0, 1).toUpperCase()) : '✳'}</div><h2>${escapeHtml(localProfile.name || 'Your avatar')}</h2><p class="campus-handle">${localProfile.username ? `@${escapeHtml(localProfile.username)}` : 'Local player'}</p><div class="aside-rule"></div><p class="aside-title">Campus people</p><p class="campus-people-note">Human student characters in individual campus fits appear inside the first-person view.</p><div class="game-note"><span class="note-mark">↗</span><p>Solo preview: other players, room chat, and live sessions aren’t connected yet.</p></div><form class="classroom-builder" id="classroom-builder"><div class="builder-heading"><span>HOST CONTROLS · LOCAL BUILD</span><strong>Create your classroom</strong></div><label>Classroom name<input name="classroom-name" maxlength="42" value="${escapeHtml(classroomSetup.name)}" required></label><label>Environment<select name="classroom-style"><option value="lecture" ${classroomSetup.style === 'lecture' ? 'selected' : ''}>Lecture hall · warm wood</option><option value="studio" ${classroomSetup.style === 'studio' ? 'selected' : ''}>Creative studio · blue seats</option><option value="garden" ${classroomSetup.style === 'garden' ? 'selected' : ''}>Garden classroom · olive seats</option></select></label><div class="chair-control"><label for="chair-count">Chairs</label><output id="chair-count-output" for="chair-count" aria-live="polite">${classroomSetup.chairs}</output><input name="chair-count" id="chair-count" aria-label="Chair count" type="range" min="2" max="48" step="1" value="${classroomSetup.chairs}"></div><button class="build-room-button" type="submit">Build classroom preview</button><small>Room name, style, and chair count save on this device. Nothing is hosted online.</small></form></aside></div>
      <div class="campus-footer"><span>W/S WALK · A/D TURN 360° · DRAG TO LOOK</span><span>APPROACH A DOOR · ENTER TO VISIT</span><span>NO ACCOUNT · NO NETWORK</span></div>
    </div>
  </section>`;
}

function mountCampusPreview(): void {
  const host = document.querySelector<HTMLElement>('#campus-game');
  if (!host) return;
  void import('./game/campus-game').then(({ mountCampusGame }) => {
    if (!host.isConnected || activeSection !== 'Campus Life') return;
    destroyCampusGame = mountCampusGame(host, classroomSetup, (room) => {
      const location = document.querySelector<HTMLElement>('#campus-location');
      const hint = document.querySelector<HTMLElement>('#game-hint');
      const roomName = room?.id === 'lecture-hall' ? classroomSetup.name : room?.name;
      if (location) location.textContent = room ? `INSIDE ${roomName!.toUpperCase()} · SOLO` : 'ON CAMPUS · SOLO';
      if (hint) hint.textContent = room ? 'ESC TO EXIT TO CAMPUS' : 'W TO WALK · A/D TO TURN · DRAG TO LOOK';
      const action = document.querySelector<HTMLButtonElement>('#room-action');
      if (action && room) { action.textContent = 'Exit to campus'; action.disabled = false; }
    }, (nearbyRoom) => {
      const action = document.querySelector<HTMLButtonElement>('#room-action');
      if (action && !document.querySelector('#campus-location')?.textContent?.startsWith('INSIDE')) {
        const name = nearbyRoom?.id === 'lecture-hall' ? classroomSetup.name : nearbyRoom?.name;
        action.textContent = nearbyRoom ? `Enter ${name}` : 'Walk up to a room to enter';
        action.disabled = !nearbyRoom;
      }
    });
  }).catch(() => announce('The campus map could not load. Refresh the page and try again.'));
  document.querySelector<HTMLButtonElement>('#room-action')?.addEventListener('click', () => window.dispatchEvent(new Event('campus-interact')));
  document.querySelector<HTMLInputElement>('#chair-count')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const output = document.querySelector<HTMLOutputElement>('#chair-count-output');
    if (output) output.value = input.value;
  });
  document.querySelector<HTMLFormElement>('#classroom-builder')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const style = String(form.get('classroom-style')) as RoomStyle;
    classroomSetup = {
      name: String(form.get('classroom-name') ?? '').trim().slice(0, 42) || 'The Yard Classroom',
      style: ['lecture', 'studio', 'garden'].includes(style) ? style : 'lecture',
      chairs: Math.max(2, Math.min(48, Number(form.get('chair-count')) || 12)),
    };
    localStorage.setItem(classroomKey, JSON.stringify(classroomSetup));
    window.dispatchEvent(new CustomEvent('campus-build-classroom', { detail: classroomSetup }));
    announce(`Classroom preview built with ${classroomSetup.chairs} chairs. Saved on this device.`);
  });
  document.querySelectorAll<HTMLButtonElement>('.touch-pad [data-direction]').forEach((button) => {
    const direction = button.dataset.direction!;
    const press = (event: PointerEvent): void => { event.preventDefault(); button.setPointerCapture(event.pointerId); window.dispatchEvent(new CustomEvent('campus-touch', { detail: { direction, pressed: true } })); };
    const release = (event: PointerEvent): void => { event.preventDefault(); window.dispatchEvent(new CustomEvent('campus-touch', { detail: { direction, pressed: false } })); };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });
}

function avatarMarkup(initial: string, className: string): string {
  const photo = profilePhotoDraft === null ? localProfile.avatarDataUrl : profilePhotoDraft || undefined;
  return `<span class="${className}">${photo ? `<img src="${photo}" alt="Profile photo">` : escapeHtml(initial.toUpperCase())}</span>`;
}

function renderProfilePage(): string {
  const displayName = localProfile.name || 'Your name';
  const handle = localProfile.username ? `@${localProfile.username}` : '@yourusername';
  return `<section class="profile-overlay" aria-labelledby="profile-title">
    <header class="profile-header"><button class="profile-back" id="profile-back">${icon('back', 18)}<span>Back to chats</span></button><div class="profile-header-mark"><span class="brand-glyph">g</span><span>GHETTO APP</span></div><button class="icon-button" id="profile-theme-toggle" aria-label="Switch colour theme">${icon('moon')}</button></header>
    <div class="profile-content"><div class="profile-intro"><p class="eyebrow">MAKE IT YOURS · LOCAL PREVIEW</p><h1 id="profile-title">Your corner<br>of the world.</h1><p>Your profile details stay in this browser. There’s no account and nothing is published.</p></div>
      <div class="profile-grid"><form class="profile-form" id="profile-form"><div class="form-heading"><div><span class="step-tag">ON THIS DEVICE</span><h2>Profile details</h2></div><span class="form-mark">✳</span></div>
        <div class="photo-setting">${avatarMarkup(localProfile.name?.[0] || '✳','profile-avatar photo-setting-avatar')}<div><strong>Profile photo</strong><small>PNG, JPG or WEBP · up to 900 KB</small><label class="photo-upload-button" for="profile-photo-input">Choose photo</label><input id="profile-photo-input" type="file" accept="image/png,image/jpeg,image/webp" hidden><button type="button" class="photo-remove-button" id="remove-profile-photo" ${localProfile.avatarDataUrl ? '' : 'hidden'}>Remove</button></div></div>
        <label class="field-label">Display name<input name="name" maxlength="48" required autocomplete="name" placeholder="What should people call you?" value="${escapeHtml(localProfile.name)}"></label>
        <label class="field-label">Username<div class="handle-input"><span>@</span><input name="username" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" autocomplete="off" placeholder="3–24 letters, numbers or _" value="${escapeHtml(localProfile.username)}"></div></label>
        <label class="field-label">Campus or community <span class="optional">OPTIONAL</span><input name="campus" maxlength="64" placeholder="Add your campus or community" value="${escapeHtml(localProfile.campus)}"></label>
        <label class="field-label">A little about you <span class="optional">OPTIONAL</span><textarea name="bio" maxlength="160" rows="3" placeholder="What are you into?">${escapeHtml(localProfile.bio)}</textarea></label>
        <div class="form-actions"><button class="save-profile" type="submit">Save on this device <span>↗</span></button><span class="save-note" id="save-note">Nothing leaves your browser.</span></div>
      </form>
      <aside class="profile-preview"><div class="profile-preview-top"><span>PREVIEW</span><span>PRIVATE · THIS DEVICE</span></div>${avatarMarkup(localProfile.name?.trim().slice(0, 1) || '✳','profile-avatar')}<h2>${escapeHtml(displayName)}</h2><p class="profile-handle">${escapeHtml(handle)}</p>${localProfile.campus ? `<span class="campus-chip">${icon('campus', 14)} ${escapeHtml(localProfile.campus)}</span>` : ''}<p class="profile-bio">${escapeHtml(localProfile.bio || 'Your story will show up here.')}</p><div class="preview-footnote">This is a private preview.<br>It isn’t visible to other people.</div></aside></div>
      <div class="profile-footer"><span>NO ACCOUNT REQUIRED</span><span>LOCAL PREVIEW · 01</span></div>
    </div>
  </section>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function scrollMessagesToEnd(): void {
  const list = document.querySelector('#message-list');
  if (list) list.scrollTop = list.scrollHeight;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((button) => button.addEventListener('click', () => {
    const section = button.dataset.section as Section;
    activeSection = section;
    activePane = section === 'Chats' ? activePane : 'inbox';
    render();
  }));
  const toggleTheme = (): void => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ghetto-app-theme', next);
    render();
  };
  document.querySelector('#theme-toggle')?.addEventListener('click', toggleTheme);
  document.querySelector('#theme-toggle-mobile')?.addEventListener('click', toggleTheme);
  document.querySelector('#profile-theme-toggle')?.addEventListener('click', toggleTheme);
  document.querySelector('#return-chats')?.addEventListener('click', () => { activeSection = 'Chats'; render(); });
  document.querySelector('#profile-back')?.addEventListener('click', () => { activeSection = 'Chats'; render(); });
  document.querySelector('#campus-back')?.addEventListener('click', () => { activeSection = 'Chats'; render(); });
  document.querySelector<HTMLFormElement>('#profile-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    localProfile = {
      name: String(data.get('name') ?? '').trim(),
      username: String(data.get('username') ?? '').trim().replace(/^@/, ''),
      campus: String(data.get('campus') ?? '').trim(),
      bio: String(data.get('bio') ?? '').trim(),
      avatarDataUrl: profilePhotoDraft === null ? localProfile.avatarDataUrl : profilePhotoDraft || undefined,
    };
    profilePhotoDraft = null;
    try { localStorage.setItem(profileKey, JSON.stringify(localProfile)); } catch { announce('Profile photo is too large for this browser. Choose a smaller image.'); return; }
    render();
    announce('Profile saved in this browser. It is not public.');
  });
  document.querySelector<HTMLInputElement>('#profile-photo-input')?.addEventListener('change', (event) => {
    const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 900 * 1024) { announce('Choose a PNG, JPG or WEBP photo under 900 KB.'); input.value = ''; return; }
    const reader = new FileReader(); reader.onload = () => { profilePhotoDraft = String(reader.result); document.querySelectorAll<HTMLElement>('.profile-avatar').forEach((node) => { node.innerHTML = `<img src="${profilePhotoDraft}" alt="Profile photo">`; }); document.querySelector('#remove-profile-photo')?.removeAttribute('hidden'); }; reader.onerror = () => announce('That photo could not be read.'); reader.readAsDataURL(file);
  });
  document.querySelector('#remove-profile-photo')?.addEventListener('click', () => { profilePhotoDraft = ''; document.querySelectorAll<HTMLElement>('.profile-avatar').forEach((node) => { node.textContent = localProfile.name?.[0]?.toUpperCase() || '✳'; }); document.querySelector('#remove-profile-photo')?.setAttribute('hidden',''); });
  bindChatEvents();
}

function bindChatEvents(): void {
  document.querySelector('#new-chat')?.addEventListener('click', () => { const modal = document.querySelector<HTMLElement>('#new-chat-modal'); if (modal) { modal.hidden = false; modal.querySelector<HTMLInputElement>('input[name="name"]')?.focus(); } });
  document.querySelector('#close-new-chat')?.addEventListener('click', () => { const modal = document.querySelector<HTMLElement>('#new-chat-modal'); if (modal) modal.hidden = true; });
  document.querySelector('#new-chat-modal')?.addEventListener('click', (event) => { if (event.target === event.currentTarget) (event.currentTarget as HTMLElement).hidden = true; });
  document.querySelector<HTMLSelectElement>('#new-chat-kind')?.addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    const picker = document.querySelector<HTMLElement>('#member-picker');
    if (picker) picker.hidden = select.value !== 'group';
  });
  document.querySelector<HTMLFormElement>('#new-chat-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const name = String(data.get('name') ?? '').trim();
    if (!name) return;
    const kind = data.get('kind') === 'group' ? 'group' : 'direct';
    const memberIds = data.getAll('members').map(String);
    const members = kind === 'group' ? ['You', ...conversations.filter((item) => item.kind === 'direct' && memberIds.includes(item.id)).map((item) => item.name)] : undefined;
    const conversation: PreviewConversation = { id: crypto.randomUUID(), name, initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(), kind, campus: String(data.get('campus') ?? '').trim().slice(0, 64), members, archived: false, muted: false, pinned: false, unread: 0, messages: [] };
    conversations.unshift(conversation); saveConversations(); activeConversationId = conversation.id; chatView = 'inbox'; chatFilter = 'all'; activePane = 'conversation'; showChatDetails = false;
    render(); announce('Chat preview created on this device. It has not been sent or shared.');
  });
  document.querySelector('#show-requests')?.addEventListener('click', () => { chatView = 'requests'; activePane = 'inbox'; render(); });
  document.querySelector('#back-to-chat-inbox')?.addEventListener('click', () => { chatView = 'inbox'; activePane = 'inbox'; render(); });
  document.querySelector('#show-archived')?.addEventListener('click', () => { chatView = chatView === 'archived' ? 'inbox' : 'archived'; activePane = 'inbox'; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-chat-filter]').forEach((button) => button.addEventListener('click', () => { chatFilter = button.dataset.chatFilter as typeof chatFilter; chatView = 'inbox'; activePane = 'inbox'; render(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-open-chat]').forEach((button) => button.addEventListener('click', () => {
    activeConversationId = button.dataset.openChat!; chatView = 'inbox'; activePane = 'conversation'; showChatDetails = false; replyMessageId = null;
    const conversation = currentConversation(); conversation.unread = 0; saveConversations(); render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-archive-chat]').forEach((button) => button.addEventListener('click', () => {
    const conversation = conversations.find((item) => item.id === button.dataset.archiveChat); if (!conversation) return;
    conversation.archived = !conversation.archived; saveConversations();
    if (conversation.id === activeConversationId && conversation.archived) activePane = 'inbox';
    render(); announce(conversation.archived ? 'Chat moved to Archived on this device.' : 'Chat restored from Archived.');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-accept-request]').forEach((button) => button.addEventListener('click', () => {
    const request = requests.find((item) => item.id === button.dataset.acceptRequest); if (!request) return;
    requests = requests.filter((item) => item.id !== request.id); saveRequests();
    const conversation: PreviewConversation = { id: crypto.randomUUID(), name: request.name, initials: request.initials, kind: 'direct', campus: request.campus, archived: false, muted: false, pinned: false, unread: 0, messages: [{ id: crypto.randomUUID(), text: request.note, time: 'Request preview', from: 'sample' }] };
    conversations.unshift(conversation); saveConversations(); activeConversationId = conversation.id; chatView = 'inbox'; activePane = 'conversation'; render(); announce('Request accepted in this local preview only.');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-decline-request]').forEach((button) => button.addEventListener('click', () => { requests = requests.filter((item) => item.id !== button.dataset.declineRequest); saveRequests(); render(); announce('Request removed from this device preview.'); }));
  document.querySelector('#conversation-menu')?.addEventListener('click', () => { showChatDetails = !showChatDetails; render(); });
  document.querySelector('#close-chat-details')?.addEventListener('click', () => { showChatDetails = false; render(); });
  document.querySelector('#toggle-mute')?.addEventListener('click', () => { const item = currentConversation(); item.muted = !item.muted; saveConversations(); render(); announce(item.muted ? 'Notifications muted in this preview.' : 'Notifications unmuted.'); });
  document.querySelector('#toggle-pin')?.addEventListener('click', () => { const item = currentConversation(); item.pinned = !item.pinned; saveConversations(); render(); });
  document.querySelector('#archive-active-chat')?.addEventListener('click', () => { const item = currentConversation(); item.archived = !item.archived; saveConversations(); activePane = 'inbox'; showChatDetails = false; render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-remove-group-member]').forEach((button) => button.addEventListener('click', () => { const item = currentConversation(); item.members = (item.members ?? []).filter((member) => member !== button.dataset.removeGroupMember); saveConversations(); render(); }));
  document.querySelector('#add-group-member-button')?.addEventListener('click', () => { const select = document.querySelector<HTMLSelectElement>('#add-group-member'); const member = conversations.find((item) => item.id === select?.value); if (!member || member.kind !== 'direct') return; const group = currentConversation(); group.members = [...new Set([...(group.members ?? []), member.name])]; saveConversations(); render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-reply-message]').forEach((button) => button.addEventListener('click', () => { replyMessageId = button.dataset.replyMessage!; render(); document.querySelector<HTMLTextAreaElement>('#message-input')?.focus(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-react-message]').forEach((button) => button.addEventListener('click', () => { const item = currentConversation(); const message = item.messages.find((entry) => entry.id === button.dataset.reactMessage); if (message) message.reaction = message.reaction ? '' : '❤️'; saveConversations(); render(); }));
  document.querySelector('#cancel-reply')?.addEventListener('click', () => { replyMessageId = null; render(); });
  document.querySelector('#back-to-inbox')?.addEventListener('click', () => { activePane = 'inbox'; render(); });
  document.querySelector('#attach-button')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#chat-attachment-input')?.click());
  const readChatAttachment = (input: HTMLInputElement, gifOnly = false): void => {
    const file = input.files?.[0]; if (!file) return;
    if (file.size > 1024 * 1024) { announce('Local preview attachments must be 1 MB or smaller.'); input.value = ''; return; }
    if (gifOnly && file.type !== 'image/gif') { announce('Choose a GIF image.'); input.value = ''; return; }
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'].includes(file.type)) { announce('Choose a PNG, JPG, GIF, WEBP, PDF, or text file.'); input.value = ''; return; }
    const reader = new FileReader(); reader.onload = () => { pendingAttachment = { name: file.name.slice(0, 120), type: file.type, dataUrl: String(reader.result) }; gifPickerOpen = false; render(); announce(`${file.name} attached to your local draft.`); }; reader.onerror = () => announce('That file could not be read. Try another file.'); reader.readAsDataURL(file);
  };
  document.querySelector<HTMLInputElement>('#chat-attachment-input')?.addEventListener('change', (event) => {
    const input = event.currentTarget as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    readChatAttachment(input);
  });
  document.querySelector('#gif-button')?.addEventListener('click', () => { gifPickerOpen = !gifPickerOpen; emojiPickerOpen = false; gifSearch = ''; render(); document.querySelector<HTMLInputElement>('#gif-search-input')?.focus(); if (gifPickerOpen && giphyApiKey) void searchGiphy(); });
  document.querySelector('#close-gif-picker')?.addEventListener('click', () => { gifPickerOpen = false; render(); document.querySelector<HTMLTextAreaElement>('#message-input')?.focus(); });
  const chooseGifFile = (): void => document.querySelector<HTMLInputElement>('#gif-file-input')?.click();
  document.querySelector('#gif-upload-action')?.addEventListener('click', chooseGifFile);
  document.querySelector('#gif-upload-footer')?.addEventListener('click', chooseGifFile);
  document.querySelector('#save-giphy-key')?.addEventListener('click', () => {
    const key = document.querySelector<HTMLInputElement>('#giphy-key-input')?.value.trim() ?? '';
    if (key.length < 8 || key.length > 200) { announce('Enter a valid GIPHY API key.'); return; }
    giphyApiKey = key; localStorage.setItem('ghetto-app-giphy-key', key); gifSearch = ''; void searchGiphy();
  });
  document.querySelector<HTMLInputElement>('#gif-file-input')?.addEventListener('change', (event) => readChatAttachment(event.currentTarget as HTMLInputElement, true));
  document.querySelector<HTMLInputElement>('#gif-search-input')?.addEventListener('input', (event) => {
    gifSearch = (event.currentTarget as HTMLInputElement).value.trim();
    document.querySelectorAll<HTMLElement>('.gif-result[data-select-gif]').forEach((button) => { button.hidden = !button.title.toLowerCase().includes(gifSearch.toLowerCase()); });
    window.clearTimeout(gifSearchTimer);
    if (giphyApiKey) gifSearchTimer = window.setTimeout(() => void searchGiphy(gifSearch), gifSearch ? 320 : 0);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-select-gif]').forEach((button) => button.addEventListener('click', () => {
    const gif = conversations.flatMap((conversation) => conversation.messages).find((message) => message.id === button.dataset.selectGif)?.attachment;
    if (!gif) return; pendingAttachment = { ...gif }; gifPickerOpen = false; render(); announce(`${gif.name} added to your draft.`);
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-select-online-gif]').forEach((button) => button.addEventListener('click', () => {
    const gif = gifResults.find((item) => item.id === button.dataset.selectOnlineGif); if (!gif) return;
    pendingAttachment = { name: gif.title.slice(0, 120), type: 'image/gif', dataUrl: gif.url }; gifPickerOpen = false; render(); announce('GIF added to your message draft.');
  }));
  document.querySelector('#remove-pending-attachment')?.addEventListener('click', () => { pendingAttachment = undefined; render(); });
  document.querySelector('#emoji-button')?.addEventListener('click', () => { emojiPickerOpen = !emojiPickerOpen; gifPickerOpen = false; emojiSearch = ''; render(); document.querySelector<HTMLInputElement>('#emoji-search')?.focus(); });
  document.querySelector('#close-emoji-picker')?.addEventListener('click', () => { emojiPickerOpen = false; render(); document.querySelector<HTMLTextAreaElement>('#message-input')?.focus(); });
  document.querySelectorAll<HTMLButtonElement>('[data-emoji-category]').forEach((button) => button.addEventListener('click', () => { emojiCategory = button.dataset.emojiCategory ?? 'Faces'; emojiSearch = ''; render(); }));
  document.querySelector<HTMLInputElement>('#emoji-search')?.addEventListener('input', (event) => { emojiSearch = (event.currentTarget as HTMLInputElement).value; const query = emojiSearch.toLowerCase(); document.querySelectorAll<HTMLButtonElement>('[data-insert-emoji]').forEach((button) => { button.hidden = !!query && !`${button.dataset.insertEmoji} ${button.dataset.emojiSearch}`.toLowerCase().includes(query); }); });
  document.querySelectorAll<HTMLButtonElement>('[data-insert-emoji]').forEach((button) => button.addEventListener('click', () => { const input = document.querySelector<HTMLTextAreaElement>('#message-input'); if (!input) return; const emoji = button.dataset.insertEmoji ?? ''; const start = input.selectionStart; input.setRangeText(emoji, start, input.selectionEnd, 'end'); input.focus(); }));
  document.querySelector<HTMLTextAreaElement>('#message-input')?.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); document.querySelector<HTMLFormElement>('#composer')?.requestSubmit(); } });
  document.querySelector<HTMLFormElement>('#composer')?.addEventListener('submit', (event) => {
    event.preventDefault(); const input = document.querySelector<HTMLTextAreaElement>('#message-input'); const text = input?.value.trim() ?? '';
    if (!text && !pendingAttachment) { input?.focus(); return; }
    const item = currentConversation(); item.messages.push({ id: crypto.randomUUID(), text, time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date()), from: 'you', replyTo: replyMessageId ?? undefined, attachment: pendingAttachment });
    if (item.id === 'maya') { messages = item.messages; localStorage.setItem(previewKey, JSON.stringify(messages)); }
    saveConversations(); pendingAttachment = undefined; replyMessageId = null; item.unread = 0; activePane = 'conversation'; chatView = 'inbox'; render();
  });
  document.querySelector<HTMLInputElement>('#chat-search')?.addEventListener('input', (event) => {
    chatQuery = (event.currentTarget as HTMLInputElement).value;
    const query = chatQuery.trim().toLowerCase();
    document.querySelectorAll<HTMLElement>('[data-chat-row]').forEach((row) => {
      const item = conversations.find((conversation) => conversation.id === row.dataset.chatRow);
      row.hidden = !!query && !!item && !`${item.name} ${item.campus} ${item.messages.map((message) => message.text).join(' ')}`.toLowerCase().includes(query);
    });
    document.querySelectorAll<HTMLElement>('[data-request-card]').forEach((card) => { card.hidden = !!query && !card.textContent?.toLowerCase().includes(query); });
  });
}

function announce(message: string): void {
  let toast = document.querySelector<HTMLDivElement>('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast); }
  toast.textContent = message;
  toast.classList.add('toast-visible');
  window.setTimeout(() => toast?.classList.remove('toast-visible'), 2600);
}

async function searchGiphy(query = ''): Promise<void> {
  if (!giphyApiKey) return;
  const requestId = ++gifRequestId; gifLoading = true; gifError = ''; render();
  try {
    const endpoint = query ? 'search' : 'trending';
    const params = new URLSearchParams({ api_key: giphyApiKey, limit: '18', rating: 'pg' });
    if (query) params.set('q', query.slice(0, 50));
    const response = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?${params.toString()}`);
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'GIPHY did not accept that key. Check it and try again.' : 'GIF search is unavailable right now. Try again shortly.');
    const payload = await response.json() as { data?: Array<{id?: string; title?: string; images?: {fixed_width?: {url?: string}; fixed_width_small?: {url?: string}; original?: {url?: string}}}> };
    if (requestId !== gifRequestId) return;
    gifResults = (payload.data ?? []).flatMap((item) => {
      const url = item.images?.fixed_width?.url ?? item.images?.original?.url;
      const preview = item.images?.fixed_width_small?.url ?? item.images?.fixed_width?.url ?? url;
      return item.id && url && preview && isGiphyGifUrl(url) && isGiphyGifUrl(preview) ? [{ id: item.id, title: item.title || 'GIPHY GIF', url, preview }] : [];
    });
    gifLoading = false; render();
  } catch (error) {
    if (requestId !== gifRequestId) return;
    gifLoading = false; gifError = error instanceof Error ? error.message : 'GIF search is unavailable. Check your connection.'; render();
  }
}

function isGiphyGifUrl(value: string): boolean {
  return /^https:\/\/media\d*\.giphy\.com\/media\/[a-z0-9_-]+\/[a-z0-9_-]+\.gif(?:\?[^#]*)?$/i.test(value);
}

render();
