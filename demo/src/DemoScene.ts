import Phaser from 'phaser';
import VisualNovelDialogue from '@robingamedev/visual-novel-dialogue';

export class DemoScene extends Phaser.Scene {
    private dialogue!: VisualNovelDialogue;
    private background!: Phaser.GameObjects.Rectangle;
    private characterSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();

    constructor() {
        super({ key: 'DemoScene' });
    }

    create() {
        // Create a simple background
        this.background = this.add.rectangle(400, 300, 800, 600, 0x34495e);
        
        // Create placeholder character sprites
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
                surprise: 'surprise.wav',
                hello: 'hello.wav'
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
        // Create placeholder rectangles for characters
        const yui = this.add.rectangle(200, 200, 100, 150, 0x3498db);
        yui.setVisible(false);
        this.characterSprites.set('y', yui);

        const narrator = this.add.rectangle(600, 200, 100, 150, 0x95a5a6);
        narrator.setVisible(false);
        this.characterSprites.set('n', narrator);
    }

    private showCharacter(characterId: string, emotion: string) {
        const sprite = this.characterSprites.get(characterId);
        if (sprite) {
            sprite.setVisible(true);
            // Change color based on emotion
            if (emotion === 'blush') {
                sprite.setFillStyle(0xe74c3c);
            } else if (emotion === 'angry') {
                sprite.setFillStyle(0xc0392b);
            }
        }
    }

    private hideCharacter(characterId: string) {
        const sprite = this.characterSprites.get(characterId);
        if (sprite) {
            sprite.setVisible(false);
        }
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
                    "y {style=whisper}I'm a bit nervous...{/style}",
                    "y {audio=hello}{/audio} Let me show you some emotions!",
                    "show y blush",
                    "y {style=angry}Just kidding! I'm not really angry.{/style}",
					"jump questions"
                ],
				questions: [
                    "Lets ask questions!",
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