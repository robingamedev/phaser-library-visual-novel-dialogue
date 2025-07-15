import { Scene } from 'phaser';
import { DialogueBox } from './DialogueBox';
import { ChoiceBox } from './ChoiceBox';

// Type definitions for the plugin
export interface DialogueConfig {
  fontFamily?: string;
  typeSpeed?: number;
  boxStyle?: string;
  autoForward?: boolean;
  boxAnimationSpeed?: number;
  boxPosition?: 'bottom' | 'top' | 'center';
  styles?: Record<string, TextStyle>;
  audio?: Record<string, string>;
  debug?: boolean;
}

export interface TextStyle {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
}

export interface ParsedStyle extends TextStyle {
  content: string;
}

export interface DialogueSettings {
  characters: Record<string, Character>;
}

export interface Character {
  name: string;
  color: string;
}

export interface DialogueScript {
  [label: string]: (string | ChoiceCommand)[];
}

export interface ChoiceCommand {
  Choice: Record<string, string>;
}

export interface DialogueData {
  settings: DialogueSettings;
  script: DialogueScript;
}

export default class VisualNovelDialogue {
  private scene: Scene;
  private config: DialogueConfig;
  private data: DialogueData | null = null;
  private currentLabel: string | null = null;
  private currentLineIndex: number = 0;
  private isActive: boolean = false;
  private isPaused: boolean = false;
  private dialogueBox?: DialogueBox;
  private choiceBox?: ChoiceBox | undefined;
  private typewriterTimer?: Phaser.Time.TimerEvent | undefined;
  private currentTypewriterText: string = '';
  private typewriterIndex: number = 0;
  private isTypewriting: boolean = false;
  private isShowingChoices: boolean = false;
  private currentStyle?: ParsedStyle | undefined;

  // Event callbacks
  public onLineEnd?: (line: string) => void;
  public onChoice?: (label: string, choiceText: string) => void;
  public onEnd?: () => void;
  public onShow?: (characterId: string, emotion: string) => void;
  public onHide?: (characterId: string) => void;

  constructor(scene: Scene, config: DialogueConfig = {}) {
    this.scene = scene;
    this.config = {
      fontFamily: 'Arial',
      typeSpeed: 30,
      boxStyle: 'default',
      autoForward: false,
      boxAnimationSpeed: 0,
      boxPosition: 'bottom',
      styles: {},
      audio: {},
      debug: false,
      ...config
    };

    // Create dialogue box
    this.dialogueBox = new DialogueBox(scene, this.config);

    if (this.config.debug) {
      console.log('VisualNovelDialogue initialized with config:', this.config);
    }
  }

  /**
   * Load dialogue data from JSON file or object
   */
  public load(dataOrPath: string | DialogueData): void {
    if (typeof dataOrPath === 'string') {
      // Load from file path - this will be implemented later
      console.warn('Loading from file path not yet implemented');
      return;
    }

    this.data = dataOrPath;
    this.currentLabel = null;
    this.currentLineIndex = 0;
    this.isActive = false;
    this.isPaused = false;

    if (this.config.debug) {
      console.log('Dialogue data loaded:', this.data);
    }
  }

  /**
   * Start dialogue at the specified label
   */
  public start(label: string = 'Start'): void {
    if (!this.data) {
      console.error('No dialogue data loaded. Call load() first.');
      return;
    }

    if (!this.data.script[label]) {
      console.error(`Label "${label}" not found in dialogue script.`);
      return;
    }

    this.currentLabel = label;
    this.currentLineIndex = 0;
    this.isActive = true;
    this.isPaused = false;

    if (this.config.debug) {
      console.log(`Starting dialogue at label: ${label}`);
    }

    this.processNextLine();
  }

  /**
   * Jump to a specific label
   */
  public jumpTo(label: string): void {
    if (!this.data || !this.data.script[label]) {
      console.error(`Label "${label}" not found in dialogue script.`);
      return;
    }

    this.currentLabel = label;
    this.currentLineIndex = 0;

    if (this.config.debug) {
      console.log(`Jumped to label: ${label}`);
    }

    this.processNextLine();
  }

  /**
   * Pause the dialogue
   */
  public pause(): void {
    this.isPaused = true;
    if (this.config.debug) {
      console.log('Dialogue paused');
    }
  }

  /**
   * Resume the dialogue
   */
  public resume(): void {
    this.isPaused = false;
    if (this.config.debug) {
      console.log('Dialogue resumed');
    }
    this.processNextLine();
  }

  /**
   * Process the next line in the current script
   */
  private processNextLine(): void {
    if (!this.data || !this.currentLabel || this.isPaused) {
      return;
    }

    const script = this.data.script[this.currentLabel];
    if (!script || this.currentLineIndex >= script.length) {
      this.endDialogue();
      return;
    }

    const line = script[this.currentLineIndex];
    this.currentLineIndex++;

    if (this.config.debug) {
      console.log(`Processing line ${this.currentLineIndex}:`, line);
    }

    if (line !== undefined) {
      this.processLine(line);
    } else {
      this.endDialogue();
    }
  }

  /**
   * Process a single line or command
   */
  private processLine(line: string | ChoiceCommand): void {
    if (typeof line === 'string') {
      this.processStringLine(line);
    } else if (typeof line === 'object' && 'Choice' in line) {
      this.processChoice(line.Choice);
    } else {
      // Unknown command - treat as dialogue
      this.processStringLine(String(line));
    }
  }

  /**
   * Process a string line (dialogue or command)
   */
  private processStringLine(line: string): void {
    // Check for commands
    if (line.startsWith('jump ')) {
      const targetLabel = line.substring(5).trim();
      if (targetLabel) {
        this.jumpTo(targetLabel);
      } else {
        this.endDialogue();
      }
      return;
    }

    if (line === 'end') {
      this.endDialogue();
      return;
    }

    if (line.startsWith('show ')) {
      const parts = line.substring(5).trim().split(' ');
      const characterId = parts[0] || '';
      const emotion = parts[1] || '';
      if (characterId) {
        this.onShow?.(characterId, emotion);
      }
      this.processNextLine();
      return;
    }

    if (line.startsWith('hide ')) {
      const characterId = line.substring(5).trim();
      if (characterId) {
        this.onHide?.(characterId);
      }
      this.processNextLine();
      return;
    }

    // Treat as dialogue line
    this.displayDialogue(line);
  }

  /**
   * Process a choice command
   */
  private processChoice(choices: Record<string, string>): void {
    // Hide dialogue box while choices are visible
    this.dialogueBox?.setVisible(false);
    // Destroy any previous choice box
    this.choiceBox?.destroy();
    
    this.isShowingChoices = true;
    
    // Show choice box
    this.choiceBox = new ChoiceBox(this.scene, choices, (choiceText) => {
      // On select, jump to the label and show dialogue box again
      const targetLabel = choices[choiceText];
      this.choiceBox?.destroy();
      this.dialogueBox?.setVisible(true);
      this.isShowingChoices = false;
      
      if (typeof targetLabel === 'string') {
        this.onChoice?.(targetLabel, choiceText);
        this.jumpTo(targetLabel);
      } else {
        this.endDialogue();
      }
    });
    // Position the choice box below the dialogue box
    if (this.dialogueBox) {
      this.choiceBox.setPosition(this.dialogueBox.x + 40, this.dialogueBox.y + this.dialogueBox.height + 12);
    }
  }

  /**
   * Display dialogue text in the dialogue box with typewriter effect
   */
  private displayDialogue(text: string): void {
    if (this.config.debug) {
      console.log('Displaying dialogue:', text);
    }
    
    // Reset text style at the beginning of each new line
    this.dialogueBox?.resetTextStyle();
    
    // Parse character dialogue (format: "characterId dialogue text")
    const spaceIndex = text.indexOf(' ');
    if (spaceIndex > 0) {
      const characterId = text.substring(0, spaceIndex);
      const dialogueText = text.substring(spaceIndex + 1);
      
      // Get character info from settings
      if (this.data?.settings.characters[characterId]) {
        const character = this.data.settings.characters[characterId];
        this.dialogueBox?.setNameplate(character.name, character.color);
        this.startTypewriter(dialogueText);
      } else {
        // No character found, treat as narrator/plain text
        this.dialogueBox?.hideNameplate();
        this.startTypewriter(text);
      }
    } else {
      // No character ID, treat as plain text
      this.dialogueBox?.hideNameplate();
      this.startTypewriter(text);
    }
    
    this.onLineEnd?.(text);
    
    // Auto-advance if configured
    if (this.config.autoForward) {
      this.processNextLine();
    }
  }

  /**
   * Start typewriter effect for text
   */
  private startTypewriter(text: string): void {
    // Clear any existing typewriter
    this.stopTypewriter();
    
    // Parse inline formatting
    const parsedText = this.parseInlineFormatting(text);
    
    this.currentTypewriterText = parsedText.text;
    this.typewriterIndex = 0;
    this.isTypewriting = true;
    
    // Store the style for use during typewriter
    this.currentStyle = parsedText.styles.length > 0 ? parsedText.styles[0] : undefined;
    
    // Set initial empty text (style already reset in displayDialogue)
    this.dialogueBox?.setText('');
    
    // Calculate delay between characters (in milliseconds)
    const delay = 1000 / (this.config.typeSpeed || 30);
    
    // Start typewriter timer
    this.typewriterTimer = this.scene.time.addEvent({
      delay: delay,
      callback: this.onTypewriterTick,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Parse inline formatting tags
   */
  private parseInlineFormatting(text: string): { text: string; styles: ParsedStyle[]; audio: string[] } {
    const styles: ParsedStyle[] = [];
    const audio: string[] = [];
    let cleanText = text;
    
    // Parse style tags: {style=value}text{/style}
    const styleRegex = /\{style=([^}]+)\}(.*?)\{\/style\}/g;
    cleanText = cleanText.replace(styleRegex, (match, styleName, content) => {
      const style = this.config.styles?.[styleName];
      if (style) {
        styles.push({ ...style, content });
      }
      return content;
    });
    
    // Parse audio tags: {audio=value}{/audio}
    const audioRegex = /\{audio=([^}]+)\}\{\/audio\}/g;
    cleanText = cleanText.replace(audioRegex, (match, audioName) => {
      const audioFile = this.config.audio?.[audioName];
      if (audioFile) {
        audio.push(audioFile);
        // Play audio immediately
        this.playAudio(audioFile);
      }
      return '';
    });
    
    return { text: cleanText, styles, audio };
  }

  /**
   * Play audio file
   */
  private playAudio(audioKey: string): void {
    try {
      this.scene.sound.play(audioKey);
      if (this.config.debug) {
        console.log(`Playing audio: ${audioKey}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.log(`Audio not found: ${audioKey}`);
      }
    }
  }

  /**
   * Apply text styling to dialogue box
   */
  private applyTextStyle(style: TextStyle): void {
    if (!this.dialogueBox) return;
    
    // This is a simplified implementation
    // In a full implementation, you'd need to handle rich text formatting
    // For now, we'll just log the style application
    if (this.config.debug) {
      console.log('Applying style:', style);
    }
  }

  /**
   * Handle typewriter tick
   */
  private onTypewriterTick(): void {
    if (!this.isTypewriting || this.typewriterIndex >= this.currentTypewriterText.length) {
      this.stopTypewriter();
      return;
    }
    
    this.typewriterIndex++;
    const displayText = this.currentTypewriterText.substring(0, this.typewriterIndex);
    
    // Always use setTextWithStyle to preserve the current style during typewriter
    if (this.currentStyle) {
      this.dialogueBox?.setTextWithStyle(displayText, this.currentStyle);
    } else {
      // For lines without style, we need to reset to default first
      this.dialogueBox?.resetTextStyle();
      this.dialogueBox?.setText(displayText);
    }
    
    if (this.typewriterIndex >= this.currentTypewriterText.length) {
      this.stopTypewriter();
    }
  }

  /**
   * Stop typewriter effect
   */
  private stopTypewriter(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = undefined;
    }
    this.isTypewriting = false;
  }

  /**
   * Skip typewriter effect (show full text immediately)
   */
  public skipTypewriter(): void {
    if (this.isTypewriting) {
      this.stopTypewriter();
      
      // Preserve the current style when skipping
      if (this.currentStyle) {
        this.dialogueBox?.setTextWithStyle(this.currentTypewriterText, this.currentStyle);
      } else {
        this.dialogueBox?.setText(this.currentTypewriterText);
      }
    }
  }

  /**
   * Check if typewriter is currently active
   */
  public isTypewriterActive(): boolean {
    return this.isTypewriting;
  }

  /**
   * Check if choices are currently being displayed
   */
  public isChoicesActive(): boolean {
    return this.isShowingChoices;
  }

  /**
   * Advance to the next line in the current script (manual progression)
   */
  public nextLine(): void {
    if (!this.isTypewriting && !this.isShowingChoices) {
      this.processNextLine();
    }
  }

  /**
   * End the dialogue sequence
   */
  private endDialogue(): void {
    this.isActive = false;
    this.currentLabel = null;
    this.currentLineIndex = 0;

    // Hide dialogue and choice boxes
    this.dialogueBox?.setVisible(false);
    this.choiceBox?.destroy();
    this.choiceBox = undefined;

    if (this.config.debug) {
      console.log('Dialogue ended');
    }

    this.onEnd?.();
  }

  /**
   * Show the dialogue box
   */
  public show(): void {
    this.dialogueBox?.setVisible(true);
  }

  /**
   * Hide the dialogue box
   */
  public hide(): void {
    this.dialogueBox?.setVisible(false);
  }
} 