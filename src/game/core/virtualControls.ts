import * as Phaser from 'phaser';

import type { InputSnapshot } from '../types';
import { emptyInputSnapshot } from './input';

interface VirtualButton {
  action: 'jump' | 'attack';
  pointerId: number | null;
  pressed: boolean;
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
}

interface VirtualControlsOptions {
  visible: boolean;
  safeLeft?: number;
  safeRight?: number;
  safeBottom?: number;
}

const CONTROL_DEPTH = 140;
const JOYSTICK_RADIUS = 58;
const JOYSTICK_KNOB_RADIUS = 24;
const JOYSTICK_WALK_THRESHOLD = 0.22;
const JOYSTICK_RUN_THRESHOLD = 0.76;
const LEFT_ZONE_WIDTH = 0.52;
const LEFT_ZONE_TOP = 0.30;
const BUTTON_RADIUS = 44;
const BUTTON_GAP = 18;

export class VirtualControls {
  private enabled: boolean | null = null;
  private joystickPointerId: number | null = null;
  private joystickOrigin = new Phaser.Math.Vector2();
  private joystickCurrent = new Phaser.Math.Vector2();
  private axisX = 0;
  private readonly joystickGraphics: Phaser.GameObjects.Graphics;
  private readonly buttons: VirtualButton[];
  private readonly safeLeft: number;
  private readonly safeRight: number;
  private readonly safeBottom: number;

  constructor(private readonly scene: Phaser.Scene, options: VirtualControlsOptions) {
    this.safeLeft = options.safeLeft ?? 54;
    this.safeRight = options.safeRight ?? 42;
    this.safeBottom = options.safeBottom ?? 38;
    this.scene.input.addPointer(3);
    this.joystickGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(CONTROL_DEPTH);
    this.buttons = [
      this.createButton('jump', 'JUMP', this.buttonX(1), this.buttonY(0), BUTTON_RADIUS + 5),
      this.createButton('attack', 'ATK', this.buttonX(0), this.buttonY(1), BUTTON_RADIUS)
    ];

    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);
    this.scene.input.on('pointerupoutside', this.handlePointerUp, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    this.setEnabled(options.visible);
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) {
      return;
    }

    this.enabled = enabled;

    if (!enabled) {
      this.resetJoystick();
      this.buttons.forEach((button) => {
        button.pointerId = null;
        button.pressed = false;
      });
    }

    this.joystickGraphics.setVisible(enabled);
    this.buttons.forEach((button) => {
      button.circle.setVisible(enabled);
      button.label.setVisible(enabled);
      this.updateButtonVisual(button);
    });
  }

  readInput(): InputSnapshot {
    const input = emptyInputSnapshot();

    if (!this.enabled) {
      return input;
    }

    const axisMagnitude = Math.abs(this.axisX);

    input.left = this.axisX < -JOYSTICK_WALK_THRESHOLD;
    input.right = this.axisX > JOYSTICK_WALK_THRESHOLD;
    input.run = axisMagnitude >= JOYSTICK_RUN_THRESHOLD;
    input.jump = this.isPressed('jump');
    input.attack = this.isPressed('attack');
    input.pointerDown = this.joystickPointerId !== null || this.buttons.some((button) => button.pressed);

    return input;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    this.joystickGraphics.destroy();
    this.buttons.forEach((button) => {
      button.circle.destroy();
      button.label.destroy();
    });
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) {
      return;
    }

    const button = this.buttonAt(pointer.x, pointer.y);

    if (button && button.pointerId === null) {
      button.pointerId = pointer.id;
      button.pressed = true;
      this.updateButtonVisual(button);
      return;
    }

    if (this.joystickPointerId === null && this.isInLeftZone(pointer.x, pointer.y)) {
      this.joystickPointerId = pointer.id;
      this.joystickOrigin.set(pointer.x, pointer.y);
      this.joystickCurrent.copy(this.joystickOrigin);
      this.axisX = 0;
      this.drawJoystick();
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || pointer.id !== this.joystickPointerId) {
      return;
    }

    const deltaX = Phaser.Math.Clamp(pointer.x - this.joystickOrigin.x, -JOYSTICK_RADIUS, JOYSTICK_RADIUS);

    this.axisX = deltaX / JOYSTICK_RADIUS;
    this.joystickCurrent.set(this.joystickOrigin.x + deltaX, this.joystickOrigin.y);
    this.drawJoystick();
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.joystickPointerId) {
      this.resetJoystick();
    }

    this.buttons.forEach((button) => {
      if (button.pointerId !== pointer.id) {
        return;
      }

      button.pointerId = null;
      button.pressed = false;
      this.updateButtonVisual(button);
    });
  }

  private createButton(
    action: VirtualButton['action'],
    labelText: string,
    x: number,
    y: number,
    radius: number
  ): VirtualButton {
    const circle = this.scene.add
      .circle(x, y, radius, 0x0f172a, 0.42)
      .setStrokeStyle(3, 0xf8fafc, 0.56)
      .setScrollFactor(0)
      .setDepth(CONTROL_DEPTH)
      .setInteractive();
    const label = this.scene.add
      .text(x, y, labelText, {
        color: '#f8fafc',
        fontFamily: 'monospace',
        fontSize: labelText.length > 3 ? '17px' : '21px',
        stroke: '#020617',
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(CONTROL_DEPTH + 1);
    const button: VirtualButton = {
      action,
      pointerId: null,
      pressed: false,
      circle,
      label
    };

    this.updateButtonVisual(button);

    return button;
  }

  private updateButtonVisual(button: VirtualButton): void {
    const fillColor = button.action === 'jump' ? 0x2563eb : 0x7c2d12;
    const alpha = button.pressed ? 0.76 : 0.42;
    const strokeAlpha = button.pressed ? 0.95 : 0.56;

    button.circle.setFillStyle(fillColor, alpha);
    button.circle.setStrokeStyle(3, 0xf8fafc, strokeAlpha);
    button.label.setAlpha(button.pressed ? 1 : 0.84);
  }

  private buttonAt(x: number, y: number): VirtualButton | null {
    return this.buttons.find((button) => {
      const radius = button.circle.radius;

      return Phaser.Math.Distance.Between(x, y, button.circle.x, button.circle.y) <= radius;
    }) ?? null;
  }

  private isPressed(action: VirtualButton['action']): boolean {
    return this.buttons.some((button) => button.action === action && button.pressed);
  }

  private isInLeftZone(x: number, y: number): boolean {
    const camera = this.scene.cameras.main;

    return x >= this.safeLeft && x <= camera.width * LEFT_ZONE_WIDTH && y >= camera.height * LEFT_ZONE_TOP;
  }

  private drawJoystick(): void {
    this.joystickGraphics.clear();

    if (this.joystickPointerId === null) {
      return;
    }

    this.joystickGraphics.lineStyle(3, 0xf8fafc, 0.42);
    this.joystickGraphics.fillStyle(0x020617, 0.34);
    this.joystickGraphics.fillCircle(this.joystickOrigin.x, this.joystickOrigin.y, JOYSTICK_RADIUS);
    this.joystickGraphics.strokeCircle(this.joystickOrigin.x, this.joystickOrigin.y, JOYSTICK_RADIUS);
    this.drawThresholdMarkers();
    this.joystickGraphics.fillStyle(0x38bdf8, 0.72);
    this.joystickGraphics.fillCircle(this.joystickCurrent.x, this.joystickCurrent.y, JOYSTICK_KNOB_RADIUS);
    this.joystickGraphics.lineStyle(2, 0xf8fafc, 0.65);
    this.joystickGraphics.strokeCircle(this.joystickCurrent.x, this.joystickCurrent.y, JOYSTICK_KNOB_RADIUS);
  }

  private resetJoystick(): void {
    this.joystickPointerId = null;
    this.axisX = 0;
    this.joystickGraphics.clear();
  }

  private drawThresholdMarkers(): void {
    this.drawThresholdMarker(JOYSTICK_WALK_THRESHOLD, 0xf8fafc, 0.34, 14);
    this.drawThresholdMarker(JOYSTICK_RUN_THRESHOLD, 0xf8fafc, 0.68, 24);
  }

  private drawThresholdMarker(threshold: number, color: number, alpha: number, height: number): void {
    const offset = JOYSTICK_RADIUS * threshold;

    this.joystickGraphics.lineStyle(2, color, alpha);
    this.joystickGraphics.lineBetween(
      this.joystickOrigin.x - offset,
      this.joystickOrigin.y - height,
      this.joystickOrigin.x - offset,
      this.joystickOrigin.y + height
    );
    this.joystickGraphics.lineBetween(
      this.joystickOrigin.x + offset,
      this.joystickOrigin.y - height,
      this.joystickOrigin.x + offset,
      this.joystickOrigin.y + height
    );
  }

  private buttonX(indexFromRight: number): number {
    const camera = this.scene.cameras.main;

    return camera.width - this.safeRight - BUTTON_RADIUS - indexFromRight * (BUTTON_RADIUS * 2 + BUTTON_GAP);
  }

  private buttonY(indexFromBottom: number): number {
    const camera = this.scene.cameras.main;

    return camera.height - this.safeBottom - BUTTON_RADIUS - indexFromBottom * (BUTTON_RADIUS * 1.55);
  }
}
