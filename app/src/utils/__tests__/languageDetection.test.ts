import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../languageDetection';

describe('Language Detection', () => {
  describe('TypeScript/JavaScript', () => {
    it('should detect TypeScript', () => {
      expect(detectLanguage('file.ts')).toBe('typescript');
      expect(detectLanguage('/path/to/file.ts')).toBe('typescript');
      expect(detectLanguage('C:\\path\\to\\file.ts')).toBe('typescript');
    });

    it('should detect TypeScript React', () => {
      expect(detectLanguage('file.tsx')).toBe('typescriptreact');
      expect(detectLanguage('/path/to/component.tsx')).toBe('typescriptreact');
    });

    it('should detect JavaScript', () => {
      expect(detectLanguage('file.js')).toBe('javascript');
      expect(detectLanguage('file.mjs')).toBe('javascript');
      expect(detectLanguage('file.cjs')).toBe('javascript');
    });

    it('should detect JavaScript React', () => {
      expect(detectLanguage('file.jsx')).toBe('javascriptreact');
    });
  });

  describe('Rust', () => {
    it('should detect Rust', () => {
      expect(detectLanguage('main.rs')).toBe('rust');
      expect(detectLanguage('/src/lib.rs')).toBe('rust');
    });
  });

  describe('Python', () => {
    it('should detect Python', () => {
      expect(detectLanguage('script.py')).toBe('python');
      expect(detectLanguage('script.pyw')).toBe('python');
    });
  });

  describe('Markdown', () => {
    it('should detect Markdown', () => {
      expect(detectLanguage('README.md')).toBe('markdown');
      expect(detectLanguage('docs.mdx')).toBe('markdown');
    });
  });

  describe('JSON', () => {
    it('should detect JSON', () => {
      expect(detectLanguage('package.json')).toBe('json');
      expect(detectLanguage('config.jsonc')).toBe('jsonc');
    });
  });

  describe('YAML', () => {
    it('should detect YAML', () => {
      expect(detectLanguage('config.yaml')).toBe('yaml');
      expect(detectLanguage('config.yml')).toBe('yaml');
    });
  });

  describe('HTML/CSS', () => {
    it('should detect HTML', () => {
      expect(detectLanguage('index.html')).toBe('html');
      expect(detectLanguage('page.htm')).toBe('html');
    });

    it('should detect CSS', () => {
      expect(detectLanguage('styles.css')).toBe('css');
      expect(detectLanguage('styles.scss')).toBe('scss');
      expect(detectLanguage('styles.sass')).toBe('sass');
      expect(detectLanguage('styles.less')).toBe('less');
    });
  });

  describe('Other languages', () => {
    it('should detect SQL', () => {
      expect(detectLanguage('query.sql')).toBe('sql');
    });

    it('should detect Shell scripts', () => {
      expect(detectLanguage('script.sh')).toBe('shell');
      expect(detectLanguage('script.bash')).toBe('shell');
      expect(detectLanguage('script.zsh')).toBe('shell');
    });

    it('should detect PowerShell', () => {
      expect(detectLanguage('script.ps1')).toBe('powershell');
    });

    it('should detect Batch files', () => {
      expect(detectLanguage('script.bat')).toBe('bat');
      expect(detectLanguage('script.cmd')).toBe('bat');
    });

    it('should detect TOML', () => {
      expect(detectLanguage('Cargo.toml')).toBe('toml');
    });

    it('should detect INI files', () => {
      expect(detectLanguage('config.ini')).toBe('ini');
      expect(detectLanguage('config.cfg')).toBe('ini');
      expect(detectLanguage('config.conf')).toBe('ini');
    });

    it('should detect plaintext', () => {
      expect(detectLanguage('file.txt')).toBe('plaintext');
      expect(detectLanguage('file.log')).toBe('plaintext');
    });
  });

  describe('Edge cases', () => {
    it('should return plaintext for files without extension', () => {
      expect(detectLanguage('file')).toBe('plaintext');
      expect(detectLanguage('/path/to/file')).toBe('plaintext');
    });

    it('should return plaintext for unknown extensions', () => {
      expect(detectLanguage('file.unknown')).toBe('plaintext');
      expect(detectLanguage('file.xyz')).toBe('plaintext');
    });

    it('should handle case insensitivity', () => {
      expect(detectLanguage('FILE.TS')).toBe('typescript');
      expect(detectLanguage('File.Ts')).toBe('typescript');
      expect(detectLanguage('file.TS')).toBe('typescript');
    });

    it('should handle empty path', () => {
      expect(detectLanguage('')).toBe('plaintext');
    });

    it('should handle path with only extension', () => {
      // A path with only extension like ".ts" is actually a valid extension
      // The function extracts ".ts" as the extension, so it correctly detects TypeScript
      expect(detectLanguage('.ts')).toBe('typescript');
      // But a path that's literally just a dot should be plaintext
      expect(detectLanguage('.')).toBe('plaintext');
    });

    it('should handle multiple dots in filename', () => {
      expect(detectLanguage('file.test.ts')).toBe('typescript');
      expect(detectLanguage('file.min.js')).toBe('javascript');
    });
  });
});

