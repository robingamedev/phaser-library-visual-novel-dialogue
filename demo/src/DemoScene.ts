import Phaser from 'phaser';
import VisualNovelDialogue from '@robingamedev/visual-novel-dialogue';
import demoData from './demo.json';

export class DemoScene extends Phaser.Scene {
    private dialogue!: VisualNovelDialogue;
    private background!: Phaser.GameObjects.Image;
    private characterSprites: Map<string, Phaser.GameObjects.Image> = new Map();

    constructor() {
        super({ key: 'DemoScene' });
    }

    preload() {
        // Load background
        this.load.image('background', 'background.png');
        
        // Load character sprites
        this.load.image('yui-normal', 'yui-normal.png');
        this.load.image('yui-blush', 'yui-blush.png');
        this.load.image('yui-angry', 'yui-angry.png');
        
        // Load audio files
        this.load.audio('hello', 'hello.mp3');
        this.load.audio('surprise', 'surprise.wav');
    }

    create() {
        // Create background
        this.background = this.add.image(400, 300, 'background');
        
        // Create character sprites
        this.createCharacterSprites();
        
        // Initialize the dialogue plugin
        this.dialogue = new VisualNovelDialogue(this, {
            fontFamily: 'Arial',
            typeSpeed: 40,
            boxStyle: 'default',
            autoForward: false,
            boxAnimationSpeed: 200,
            boxPosition: 'bottom',
            debug: true,
            styles: {
                whisper: { color: '#888888', italic: true },
                angry: { color: '#ff3333', bold: true },
                shout: { color: '#ffff00', bold: true }
            },
            audio: {
                surprise: 'surprise',
                hello: 'hello'
            }
        });

        // Set up event handlers
        this.dialogue.onLineEnd = (line) => {
            console.log('Line ended:', line);
        };

        this.dialogue.onChoice = (label, choiceText) => {
            console.log(`Choice selected: "${choiceText}" -> ${label}`);
        };

        this.dialogue.onEnd = () => {
            console.log('Dialogue ended');
            this.showRestartMessage();
        };

        this.dialogue.onShow = (characterId, emotion) => {
            console.log(`Show character: ${characterId} with emotion: ${emotion}`);
            this.showCharacter(characterId, emotion);
        };

        this.dialogue.onHide = (characterId) => {
            console.log(`Hide character: ${characterId}`);
            this.hideCharacter(characterId);
        };

        // Load and start the demo dialogue
        this.dialogue.load(demoData);
        this.dialogue.start('Start');
        
        // Set up input handlers
        this.setupInput();
    }

    private createCharacterSprites() {

        const imageX = 100; 
        const imageY = 330;

        // Create character sprites using the loaded images
        const yuiNormal = this.add.image(imageX, imageY, 'yui-normal');
        yuiNormal.setVisible(false);
        yuiNormal.setScale(0.5);
        this.characterSprites.set('y', yuiNormal);

        // We'll switch between different emotion sprites
        const yuiBlush = this.add.image(imageX, imageY, 'yui-blush');
        yuiBlush.setVisible(false);
        yuiBlush.setScale(0.5);
        this.characterSprites.set('y-blush', yuiBlush);

        const yuiAngry = this.add.image(imageX, imageY, 'yui-angry');
        yuiAngry.setVisible(false);
        yuiAngry.setScale(0.5);
        this.characterSprites.set('y-angry', yuiAngry);
    }

    private showCharacter(characterId: string, emotion: string) {
        // Hide all character sprites first
        this.characterSprites.forEach(sprite => sprite.setVisible(false));
        
        // Show the appropriate sprite based on character and emotion
        let spriteKey = characterId;
        if (characterId === 'y' && emotion) {
            spriteKey = `${characterId}-${emotion}`;
        }
        
        const sprite = this.characterSprites.get(spriteKey);
        if (sprite) {
            sprite.setVisible(true);
        } else {
            // Fallback to normal sprite if emotion sprite doesn't exist
            const fallbackSprite = this.characterSprites.get(characterId);
            if (fallbackSprite) {
                fallbackSprite.setVisible(true);
            }
        }
    }

    private hideCharacter(characterId: string) {
        // Hide all sprites for this character
        this.characterSprites.forEach((sprite, key) => {
            if (key.startsWith(characterId)) {
                sprite.setVisible(false);
            }
        });
    }

    private setupInput() {
        // Space to advance dialogue
        this.input.keyboard?.on('keydown-SPACE', () => {
            if (this.dialogue.isTypewriterActive()) {
                this.dialogue.skipTypewriter();
            } else if (this.dialogue.isChoicesActive()) {
                console.log('Please click on a choice instead of pressing SPACE');
            } else {
                this.dialogue.nextLine();
            }
        });

        // ESC to skip typewriter
        this.input.keyboard?.on('keydown-ESC', () => {
            this.dialogue.skipTypewriter();
        });
    }

    private showRestartMessage() {
        const text = this.add.text(400, 250, 'Demo completed!\nPress SPACE to restart', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        text.setOrigin(0.5);
        
        this.input.keyboard?.once('keydown-SPACE', () => {
            text.destroy();
            this.scene.restart();
        });
    }
} 