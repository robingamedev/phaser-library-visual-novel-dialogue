import Phaser from 'phaser';
import VisualNovelDialogue from '@robingamedev/visual-novel-dialogue';

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
        this.loadDemoDialogue();
        
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

    private loadDemoDialogue() {
        const demoData = {
            settings: {
                characters: {
                    n: { name: "Narrator", color: "#cccccc" },
                    y: { name: "Yui", color: "#00bfff" }
                }
            },
            script: {
                Start: [
                    "n Welcome to the Visual Novel Dialogue Demo!",
                    "n This demonstrates all the plugin features.",
                    "show y normal",
                    "y Hello! I'm Yui. Nice to meet you!",
                    "show y blush",
                    "y {style=whisper}I'm a bit nervous...{/style}",
                    "y {audio=hello}{/audio} Let me show you some emotions!",
                    "show y angry",
                    "y {style=angry}Just kidding! I'm not really angry.{/style}",
                    "show y normal",
                    "jump questions"
                ],
				questions: [
                    "y {audio=surprise}{/audio} Lets ask questions!",
					{
						Choice: {
							"Ask about the weather": "weather",
							"Ask about feelings": "feelings",
							"End conversation": "end-conversation"
						}
					}
				],
                weather: [
                    "n You asked about the weather.",
                    "y It's a beautiful day for coding!",
                    "jump questions"
                ],
                feelings: [
                    "n You asked about feelings.",
                    "y {style=shout}I LOVE THIS PLUGIN!{/style}",
                    "y {audio=surprise}{/audio} It's so much fun to use!",
                    "jump questions"
                ],
                "end-conversation": [
                    "n You chose to end the conversation.",
                    "y Goodbye! Thanks for testing!",
                    "hide y",
                    "jump End"
                ],
                End: [
                    "n Demo completed!",
                    "end"
                ]
            }
        };

        this.dialogue.load(demoData);
        this.dialogue.start('Start');
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