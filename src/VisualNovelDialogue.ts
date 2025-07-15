import { Scene } from 'phaser';

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
    // This will be implemented when we add UI rendering
    if (this.config.debug) {
      console.log('Choice presented:', choices);
    }
    
    // For now, just emit the choice event
    const [choiceText, targetLabel] = Object.entries(choices)[0] || [];
    if (typeof choiceText === 'string' && typeof targetLabel === 'string') {
      this.onChoice?.(targetLabel, choiceText);
      // Auto-select first choice for now
      this.jumpTo(targetLabel);
    } else {
      this.endDialogue();
    }
  }

  /**
   * Display dialogue text (placeholder)
   */
  private displayDialogue(text: string): void {
    if (this.config.debug) {
      console.log('Displaying dialogue:', text);
    }
    
    // This will be implemented when we add UI rendering
    this.onLineEnd?.(text);
    
    // Auto-advance if configured
    if (this.config.autoForward) {
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

    if (this.config.debug) {
      console.log('Dialogue ended');
    }

    this.onEnd?.();
  }
} 