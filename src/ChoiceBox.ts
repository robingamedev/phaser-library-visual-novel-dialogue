import { Scene, GameObjects } from 'phaser';

export class ChoiceBox extends GameObjects.Container {
  private buttons: GameObjects.Text[] = [];
  private callback: (choiceKey: string) => void;

  constructor(scene: Scene, choices: Record<string, string>, onSelect: (choiceKey: string) => void) {
    super(scene);
    this.callback = onSelect;

    const buttonWidth = 520;
    const buttonHeight = 38;
    const buttonSpacing = 12;
    const fontSize = '22px';
    const fontFamily = 'Arial';
    const baseColor = '#fff';
    const hoverColor = '#ffd700';
    let y = 0;

    Object.entries(choices).forEach(([choiceText, _], idx) => {
      const btn = scene.add.text(0, y, choiceText, {
        fontFamily,
        fontSize,
        color: baseColor,
        backgroundColor: 'rgba(40,40,60,0.85)',
        padding: { left: 16, right: 16, top: 6, bottom: 6 },
        align: 'left',
        fixedWidth: buttonWidth,
      })
        .setInteractive({ useHandCursor: true })
        .setOrigin(0, 0)
        .on('pointerover', () => btn.setColor(hoverColor))
        .on('pointerout', () => btn.setColor(baseColor))
        .on('pointerdown', () => this.handleSelect(choiceText));
      this.add(btn);
      this.buttons.push(btn);
      y += buttonHeight + buttonSpacing;
    });

    scene.add.existing(this);
    this.setDepth(1001);
  }

  private handleSelect(choiceText: string) {
    this.callback(choiceText);
    this.destroy();
  }

  destroy(fromScene?: boolean) {
    this.buttons.forEach(btn => btn.destroy());
    super.destroy(fromScene);
  }
} 