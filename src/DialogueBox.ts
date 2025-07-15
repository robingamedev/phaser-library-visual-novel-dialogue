import { Scene, GameObjects } from 'phaser';
import { DialogueConfig } from './VisualNovelDialogue';

export class DialogueBox extends GameObjects.Container {
  private background: GameObjects.Rectangle;
  private text: GameObjects.Text;
  private nameplate?: GameObjects.Text;
  private config: DialogueConfig;

  constructor(scene: Scene, config: DialogueConfig) {
    super(scene);
    this.config = config;

    // Default dimensions and style
    const width = 600;
    const height = 140;
    const padding = 24;
    const boxColor = 0x222244;
    const boxAlpha = 0.92;

    // Background
    this.background = scene.add.rectangle(0, 0, width, height, boxColor, boxAlpha);
    this.background.setOrigin(0, 0);
    this.add(this.background);

    // Text
    this.text = scene.add.text(padding, padding, '', {
      fontFamily: config.fontFamily || 'Arial',
      fontSize: '24px',
      color: '#fff',
      wordWrap: { width: width - padding * 2 },
    });
    this.text.setOrigin(0, 0);
    this.add(this.text);

    // Set position based on config
    this.setBoxPosition(config.boxPosition || 'bottom', scene.scale.width, scene.scale.height, width, height);

    scene.add.existing(this);
    this.setDepth(1000); // Ensure on top
  }

  setBoxPosition(position: 'bottom' | 'top' | 'center', screenW: number, screenH: number, boxW: number, boxH: number) {
    let x = (screenW - boxW) / 2;
    let y = 0;
    if (position === 'bottom') {
      y = screenH - boxH - 32;
    } else if (position === 'top') {
      y = 32;
    } else if (position === 'center') {
      y = (screenH - boxH) / 2;
    }
    this.setPosition(x, y);
  }

  setText(text: string) {
    this.text.setText(text);
  }

  setNameplate(name: string, color: string) {
    if (!this.nameplate) {
      this.nameplate = this.scene.add.text(0, -28, '', {
        fontFamily: this.config.fontFamily || 'Arial',
        fontSize: '20px',
        color: color || '#fff',
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { left: 8, right: 8, top: 2, bottom: 2 },
      });
      this.nameplate.setOrigin(0, 0);
      this.add(this.nameplate);
    }
    this.nameplate.setText(name);
    this.nameplate.setColor(color);
    this.nameplate.setVisible(true);
  }

  hideNameplate() {
    if (this.nameplate) {
      this.nameplate.setVisible(false);
    }
  }

  destroy(fromScene?: boolean) {
    this.background.destroy();
    this.text.destroy();
    this.nameplate?.destroy();
    super.destroy(fromScene);
  }
} 