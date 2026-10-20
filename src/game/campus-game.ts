import Phaser from 'phaser';

export type RoomStyle = 'lecture' | 'studio' | 'garden';
export type ClassroomSetup = { name: string; style: RoomStyle; chairs: number };
export type CampusRoom = { id: string; name: string; kind: string; x: number; y: number; color: number };

const OUTSIDE = [
  '111111111111', '100000000001', '100011110001', '100010000001',
  '100010110001', '100000000001', '101100001101', '100000000001',
  '100001000001', '100000000001', '100000000001', '111111111111',
];
const rooms: CampusRoom[] = [
  { id: 'lecture-hall', name: 'Lecture Hall', kind: 'CLASSROOM', x: 2.5, y: 3.5, color: 0xc36c4d },
  { id: 'library', name: 'The Library', kind: 'STUDY SPACE', x: 8.5, y: 3.5, color: 0x53745d },
  { id: 'gist-garden', name: 'Gist Garden', kind: 'HANGOUT SPACE', x: 8.3, y: 8.1, color: 0x95a75d },
];
const palette = {
  ink: 0x17221b, paper: 0xf2ead8, floor: 0xd9c8a7, green: 0x5d795a,
  outfits: [0xb74f3b, 0x315c75, 0x75528d, 0xc0843d, 0x4e7152, 0xd26b68],
  skin: [0x8d583b, 0xc68658, 0x61412f, 0xe2ae7e, 0xa96747],
  hair: [0x201b18, 0x563821, 0x262a2c, 0x5d4537],
};
type Person = { x: number; y: number; outfit: number; skin: number; hair: number; scale?: number };

class FirstPersonCampus extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private x = 6.5;
  private y = 9.4;
  private angle = -Math.PI / 2;
  private activeRoom: CampusRoom | null = null;
  private nearbyRoom: CampusRoom | null = null;
  private returningPosition = { x: 6.5, y: 9.4 };
  private lookPointer: number | null = null;
  private touchForward = 0;
  private touchTurn = 0;
  private zBuffer: number[] = [];
  private setup: ClassroomSetup;
  private onRoomChange: (room: CampusRoom | null) => void;
  private onNearbyRoom: (room: CampusRoom | null) => void;
  private people: Person[] = [
    { x: 5.5, y: 5.7, outfit: 0x315c75, skin: 0x8d583b, hair: 0x201b18 },
    { x: 2.1, y: 7.3, outfit: 0xc0843d, skin: 0xe2ae7e, hair: 0x563821 },
    { x: 9.4, y: 8.8, outfit: 0x75528d, skin: 0xa96747, hair: 0x262a2c },
  ];

  constructor(setup: ClassroomSetup, onRoomChange: (room: CampusRoom | null) => void, onNearbyRoom: (room: CampusRoom | null) => void) {
    super('FirstPersonCampus');
    this.setup = setup;
    this.onRoomChange = onRoomChange;
    this.onNearbyRoom = onNearbyRoom;
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => { this.lookPointer = pointer.id; });
    this.input.on('pointerup', () => { this.lookPointer = null; });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.lookPointer === pointer.id && pointer.isDown) this.angle = this.wrapAngle(this.angle + pointer.movementX * 0.005);
    });
    this.scale.on('resize', () => this.renderView());
    this.renderView();
  }

  setTouch(direction: string, pressed: boolean): void {
    if (direction === 'up') this.touchForward = pressed ? 1 : this.touchForward === 1 ? 0 : this.touchForward;
    if (direction === 'down') this.touchForward = pressed ? -1 : this.touchForward === -1 ? 0 : this.touchForward;
    if (direction === 'left') this.touchTurn = pressed ? -1 : this.touchTurn === -1 ? 0 : this.touchTurn;
    if (direction === 'right') this.touchTurn = pressed ? 1 : this.touchTurn === 1 ? 0 : this.touchTurn;
  }

  activateRoom(): void { this.interact(); }

  update(_time: number, delta: number): void {
    const seconds = Math.min(delta, 50) / 1000;
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC) && this.activeRoom) this.leaveRoom();

    if (this.keys.LEFT.isDown || this.keys.A.isDown) this.angle -= 1.85 * seconds;
    if (this.keys.RIGHT.isDown || this.keys.D.isDown) this.angle += 1.85 * seconds;
    if (this.touchTurn) this.angle += this.touchTurn * 1.85 * seconds;
    this.angle = this.wrapAngle(this.angle);

    const forward = Number(this.keys.W.isDown || this.keys.UP.isDown || this.touchForward > 0)
      - Number(this.keys.S.isDown || this.keys.DOWN.isDown || this.touchForward < 0);
    if (forward) {
      const distance = forward * 2.2 * seconds;
      const nx = this.x + Math.cos(this.angle) * distance;
      const ny = this.y + Math.sin(this.angle) * distance;
      if (!this.isWall(nx, this.y)) this.x = nx;
      if (!this.isWall(this.x, ny)) this.y = ny;
    }

    const nearby = this.activeRoom ? null : rooms.find((room) => Math.hypot(this.x - room.x, this.y - room.y) < 0.9) ?? null;
    if (nearby?.id !== this.nearbyRoom?.id) {
      this.nearbyRoom = nearby;
      this.onNearbyRoom(nearby);
    }
    this.renderView();
  }

  configure(setup: ClassroomSetup): void {
    this.setup = setup;
    const room = rooms[0];
    this.returningPosition = { x: this.x, y: this.y };
    this.activeRoom = room;
    this.nearbyRoom = null;
    this.x = 5.5;
    this.y = 9.5;
    this.angle = -Math.PI / 2;
    this.people = [
      { x: 5.5, y: 3.1, outfit: 0x315c75, skin: 0x8d583b, hair: 0x201b18 },
      { x: 3.8, y: 6.3, outfit: 0xb74f3b, skin: 0xe2ae7e, hair: 0x563821 },
      { x: 7.1, y: 6.8, outfit: 0x75528d, skin: 0xa96747, hair: 0x262a2c },
    ];
    this.onRoomChange(room);
    this.onNearbyRoom(null);
    this.renderView();
  }

  private currentMap(): string[] {
    if (!this.activeRoom) return OUTSIDE;
    return [
      '111111111111', '100000000001', '100000000001', '100000000001',
      '100000000001', '100000000001', '100000000001', '100000000001',
      '100000000001', '100000000001', '100000000001', '111111111111',
    ];
  }

  private isWall(x: number, y: number): boolean {
    const map = this.currentMap();
    const row = Math.floor(y);
    const col = Math.floor(x);
    return !map[row] || map[row][col] !== '0';
  }

  private interact(): void {
    if (this.activeRoom) { this.leaveRoom(); return; }
    const room = rooms.find((place) => Math.hypot(this.x - place.x, this.y - place.y) < 1.05);
    if (!room) return;
    this.returningPosition = { x: this.x, y: this.y };
    this.activeRoom = room;
    this.x = 5.5;
    this.y = 9.5;
    this.angle = -Math.PI / 2;
    this.people = room.id === 'lecture-hall'
      ? [
          { x: 5.5, y: 3.1, outfit: 0x315c75, skin: 0x8d583b, hair: 0x201b18 },
          { x: 3.8, y: 6.3, outfit: 0xb74f3b, skin: 0xe2ae7e, hair: 0x563821 },
          { x: 7.1, y: 6.8, outfit: 0x75528d, skin: 0xa96747, hair: 0x262a2c },
        ]
      : [{ x: 5.5, y: 5.5, outfit: 0x4e7152, skin: 0xc68658, hair: 0x563821 }];
    this.onRoomChange(room);
  }

  private leaveRoom(): void {
    this.activeRoom = null;
    this.x = this.returningPosition.x;
    this.y = this.returningPosition.y;
    this.people = [
      { x: 5.5, y: 5.7, outfit: 0x315c75, skin: 0x8d583b, hair: 0x201b18 },
      { x: 2.1, y: 7.3, outfit: 0xc0843d, skin: 0xe2ae7e, hair: 0x563821 },
      { x: 9.4, y: 8.8, outfit: 0x75528d, skin: 0xa96747, hair: 0x262a2c },
    ];
    this.nearbyRoom = null;
    this.onRoomChange(null);
    this.onNearbyRoom(null);
  }

  private renderView(): void {
    if (!this.graphics || !this.scale.width || !this.scale.height) return;
    const g = this.graphics;
    const width = Math.max(1, Math.floor(this.scale.width));
    const height = Math.max(1, Math.floor(this.scale.height));
    const horizon = Math.round(height * 0.47);
    const stride = 3;
    const fov = Math.PI / 2.65;
    const interior = this.activeRoom?.id === 'lecture-hall';
    const ceilings: Record<RoomStyle, number> = { lecture: 0xf1dfc4, studio: 0xd7e5ea, garden: 0xdce0c7 };
    const floors: Record<RoomStyle, [number, number]> = {
      lecture: [0xd9c8a7, 0xcbb895], studio: [0xb7c4c6, 0xa5b1b8], garden: [0xc8cba9, 0xb7be92],
    };
    g.clear();
    g.fillStyle(interior ? ceilings[this.setup.style] : 0xe2e1d0, 1); g.fillRect(0, 0, width, horizon);
    for (let band = 0; band < 14; band++) {
      const y = horizon + band * ((height - horizon) / 14);
      const floorColors = interior ? floors[this.setup.style] : [palette.floor, 0xd7c8aa];
      g.fillStyle(floorColors[band % 2], 1);
      g.fillRect(0, y, width, Math.ceil((height - horizon) / 14) + 1);
    }

    this.zBuffer = new Array(width).fill(100);
    for (let screenX = 0; screenX < width; screenX += stride) {
      const rayAngle = this.angle - fov / 2 + (screenX / width) * fov;
      const hit = this.castRay(rayAngle);
      const distance = Math.max(0.12, hit.distance * Math.cos(rayAngle - this.angle));
      const wallHeight = Math.min(height * 1.35, height * 0.76 / distance);
      const wallTop = horizon - wallHeight / 2;
      const baseColor = this.wallColor(hit.tile, distance, hit.side);
      g.fillStyle(baseColor, 1);
      g.fillRect(screenX, wallTop, stride + 1, wallHeight);
      g.fillStyle(this.activeRoom?.color ?? 0xf0d9a4, Math.max(0.12, 0.72 - distance * 0.055));
      g.fillRect(screenX, wallTop, stride + 1, Math.max(2, wallHeight * 0.035));
      for (let column = screenX; column < Math.min(width, screenX + stride); column++) this.zBuffer[column] = distance;
    }

    this.drawFloorLines(width, height, horizon);
    this.drawRoomFurniture(width, height, horizon, fov);
    this.drawPeople(width, height, horizon, fov);
    this.drawDoorPrompts(width, horizon, fov);
    this.drawVignette(width, height);
  }

  private castRay(angle: number): { distance: number; tile: number; side: number } {
    const map = this.currentMap();
    const rayX = Math.cos(angle);
    const rayY = Math.sin(angle);
    let mapX = Math.floor(this.x);
    let mapY = Math.floor(this.y);
    const deltaX = Math.abs(1 / (rayX || 0.00001));
    const deltaY = Math.abs(1 / (rayY || 0.00001));
    const stepX = rayX < 0 ? -1 : 1;
    const stepY = rayY < 0 ? -1 : 1;
    let sideX = (rayX < 0 ? this.x - mapX : mapX + 1 - this.x) * deltaX;
    let sideY = (rayY < 0 ? this.y - mapY : mapY + 1 - this.y) * deltaY;
    let side = 0;
    let distance = 12;
    let hit = false;
    for (let step = 0; step < 50 && !hit; step++) {
      if (sideX < sideY) { sideX += deltaX; mapX += stepX; side = 0; }
      else { sideY += deltaY; mapY += stepY; side = 1; }
      distance = side === 0 ? sideX - deltaX : sideY - deltaY;
      if (!map[mapY] || map[mapY][mapX] !== '0') hit = true;
    }
    return { distance: Math.max(distance, 0.12), tile: this.activeRoom ? 2 : 1, side };
  }

  private wallColor(tile: number, distance: number, side: number): number {
    const roomWalls: Record<RoomStyle, number> = { lecture: 0xa96b4e, studio: 0x4d7187, garden: 0x6e7e45 };
    const color = this.activeRoom?.id === 'lecture-hall' ? roomWalls[this.setup.style] : this.activeRoom?.color ?? (tile === 2 ? 0xe9dfca : 0x58715b);
    const shade = Math.max(0.35, 1 - distance * 0.065 - side * 0.13);
    const r = ((color >> 16) & 255) * shade;
    const green = ((color >> 8) & 255) * shade;
    const b = (color & 255) * shade;
    return (Math.round(r) << 16) | (Math.round(green) << 8) | Math.round(b);
  }

  private drawFloorLines(width: number, height: number, horizon: number): void {
    const g = this.graphics;
    g.lineStyle(1, 0x8b7c62, 0.24);
    for (let line = 1; line <= 7; line++) {
      const progress = line / 8;
      const y = horizon + Math.pow(progress, 1.85) * (height - horizon);
      g.lineBetween(0, y, width, y);
    }
    g.lineStyle(1, 0x8b7c62, 0.2);
    g.lineBetween(width * 0.5, horizon, 0, height);
    g.lineBetween(width * 0.5, horizon, width, height);
  }

  private project(worldX: number, worldY: number, width: number, horizon: number, fov: number): { x: number; y: number; distance: number } | null {
    const dx = worldX - this.x;
    const dy = worldY - this.y;
    const distance = Math.hypot(dx, dy);
    const rel = this.wrapAngle(Math.atan2(dy, dx) - this.angle);
    if (Math.abs(rel) > fov * 0.58 || distance < 0.25) return null;
    const x = width / 2 + (Math.tan(rel) / Math.tan(fov / 2)) * (width / 2);
    const y = horizon + Math.max(8, this.scale.height * 0.32 / distance);
    return { x, y, distance };
  }

  private visibleAt(screenX: number, distance: number): boolean {
    return distance <= (this.zBuffer[Math.max(0, Math.min(this.zBuffer.length - 1, Math.round(screenX)))] ?? 0);
  }

  private drawPeople(width: number, height: number, horizon: number, fov: number): void {
    const g = this.graphics;
    const people = [...this.people].sort((a, b) => Math.hypot(b.x - this.x, b.y - this.y) - Math.hypot(a.x - this.x, a.y - this.y));
    for (const person of people) {
      const point = this.project(person.x, person.y, width, horizon, fov);
      if (!point || !this.visibleAt(point.x, point.distance)) continue;
      const scale = Math.min(height * 0.72, (height * 0.82 / point.distance) * (person.scale ?? 0.92));
      const bodyWidth = scale * 0.32;
      const bodyHeight = scale * 0.48;
      const foot = horizon + scale * 0.49;
      g.fillStyle(0x29332b, 0.18); g.fillEllipse(point.x, foot, bodyWidth * 1.5, scale * 0.1);
      g.fillStyle(person.outfit, 1); g.fillRoundedRect(point.x - bodyWidth / 2, foot - bodyHeight * 0.68, bodyWidth, bodyHeight * 0.66, Math.max(2, scale * 0.07));
      g.lineStyle(Math.max(1, scale * 0.025), 0xf4d9a8, 0.72);
      g.lineBetween(point.x, foot - bodyHeight * 0.64, point.x - bodyWidth * 0.16, foot - bodyHeight * 0.42);
      g.lineBetween(point.x, foot - bodyHeight * 0.64, point.x + bodyWidth * 0.16, foot - bodyHeight * 0.42);
      g.fillStyle(person.outfit === 0x315c75 ? 0x27343b : 0x302a26, 1);
      g.fillRect(point.x - bodyWidth * 0.34, foot - bodyHeight * 0.06, bodyWidth * 0.25, bodyHeight * 0.35);
      g.fillRect(point.x + bodyWidth * 0.09, foot - bodyHeight * 0.06, bodyWidth * 0.25, bodyHeight * 0.35);
      g.fillStyle(person.skin, 1); g.fillRect(point.x - bodyWidth * 0.68, foot - bodyHeight * 0.58, bodyWidth * 0.18, bodyHeight * 0.4);
      g.fillRect(point.x + bodyWidth * 0.5, foot - bodyHeight * 0.58, bodyWidth * 0.18, bodyHeight * 0.4);
      g.fillStyle(person.skin, 1); g.fillCircle(point.x, foot - bodyHeight * 0.81, bodyWidth * 0.31);
      g.fillStyle(person.hair, 1); g.fillEllipse(point.x, foot - bodyHeight * 0.9, bodyWidth * 0.58, bodyWidth * 0.31);
    }
  }

  private drawRoomFurniture(width: number, height: number, horizon: number, fov: number): void {
    if (!this.activeRoom || this.activeRoom.id !== 'lecture-hall') return;
    const g = this.graphics;
    const chairCount = Math.max(2, Math.min(48, Math.floor(this.setup.chairs)));
    const columns = Math.min(6, chairCount);
    const rows = Math.ceil(chairCount / columns);
    const chairs: { x: number; y: number }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns && chairs.length < chairCount; column++) {
        chairs.push({ x: 2.6 + column * 1.15, y: 4.0 + row * 0.68 });
      }
    }
    chairs.sort((a, b) => Math.hypot(b.x - this.x, b.y - this.y) - Math.hypot(a.x - this.x, a.y - this.y));
    for (const chair of chairs) {
      const point = this.project(chair.x, chair.y, width, horizon, fov);
      if (!point || !this.visibleAt(point.x, point.distance)) continue;
      const size = Math.min(height * 0.26, height * 0.28 / point.distance);
      const alpha = Math.max(0.35, 1 - point.distance * 0.05);
      g.fillStyle(0x4c3529, alpha); g.fillRoundedRect(point.x - size * 0.25, point.y + size * 0.05, size * 0.5, size * 0.38, 3);
      g.fillStyle(this.setup.style === 'studio' ? 0x394f62 : this.setup.style === 'garden' ? 0x687448 : 0xa96c4d, alpha);
      g.fillRoundedRect(point.x - size * 0.34, point.y - size * 0.2, size * 0.68, size * 0.28, 4);
      g.fillStyle(0x544131, alpha); g.fillRect(point.x - size * 0.26, point.y + size * 0.36, size * 0.08, size * 0.24); g.fillRect(point.x + size * 0.18, point.y + size * 0.36, size * 0.08, size * 0.24);
    }
  }

  private drawDoorPrompts(width: number, horizon: number, fov: number): void {
    if (this.activeRoom) return;
    const g = this.graphics;
    for (const room of rooms) {
      const point = this.project(room.x, room.y, width, horizon, fov);
      if (!point || !this.visibleAt(point.x, point.distance)) continue;
      const scale = Math.min(42, 24 / point.distance);
      g.fillStyle(0x17221b, 0.82); g.fillRoundedRect(point.x - scale * 1.4, point.y - scale * 1.5, scale * 2.8, scale * 0.7, 5);
      g.fillStyle(0xc8ed53, 1); g.fillRect(point.x - scale * 0.9, point.y - scale * 1.22, scale * 1.8, 2);
    }
  }

  private drawVignette(width: number, height: number): void {
    const g = this.graphics;
    g.fillStyle(0x17221b, 0.08); g.fillRect(0, 0, width, 7); g.fillRect(0, height - 7, width, 7);
    g.fillStyle(0x17221b, 0.1); g.fillRect(0, 0, 8, height); g.fillRect(width - 8, 0, 8, height);
  }

  private wrapAngle(angle: number): number {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
  }
}

export function mountCampusGame(
  parent: HTMLElement,
  setup: ClassroomSetup,
  onRoomChange: (room: CampusRoom | null) => void,
  onNearbyRoom: (room: CampusRoom | null) => void,
): () => void {
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: 900,
    height: 560,
    backgroundColor: '#17221b',
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new FirstPersonCampus(setup, onRoomChange, onNearbyRoom)],
    render: { antialias: true, roundPixels: true },
  });
  const onTouch = (event: Event): void => {
    const detail = (event as CustomEvent<{ direction: string; pressed: boolean }>).detail;
    (game.scene.getScene('FirstPersonCampus') as FirstPersonCampus | undefined)?.setTouch(detail.direction, detail.pressed);
  };
  const onInteract = (): void => { (game.scene.getScene('FirstPersonCampus') as FirstPersonCampus | undefined)?.activateRoom(); };
  const onConfigure = (event: Event): void => {
    const detail = (event as CustomEvent<ClassroomSetup>).detail;
    (game.scene.getScene('FirstPersonCampus') as FirstPersonCampus | undefined)?.configure(detail);
  };
  window.addEventListener('campus-touch', onTouch);
  window.addEventListener('campus-interact', onInteract);
  window.addEventListener('campus-build-classroom', onConfigure);
  return () => {
    window.removeEventListener('campus-touch', onTouch);
    window.removeEventListener('campus-interact', onInteract);
    window.removeEventListener('campus-build-classroom', onConfigure);
    game.destroy(true);
  };
}
