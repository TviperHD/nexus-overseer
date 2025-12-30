import React, { useState } from 'react';
import {
  readFile,
  writeFile,
  deleteFile,
  listDirectory,
  createDirectory,
  deleteDirectory,
  getFileMetadata,
  fileExists,
  requestPathPermission,
  addAllowedPath,
  getAllowedPaths,
  watchFile,
  watchDirectory,
} from '@/utils/fileSystem';
import { setupFileWatchListeners } from '@/utils/fileSystemEvents';
import type { FileReadResult, DirectoryEntry, FileMetadata } from '@/types/filesystem';

export const FileSystemTest: React.FC = () => {
  const [testPath, setTestPath] = useState('C:\\Users\\keemo\\Documents\\nexus-test');
  const [testFile, setTestFile] = useState('C:\\Users\\keemo\\Documents\\nexus-test\\test.txt');
  const [results, setResults] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState('Hello from Nexus Overseer!\nThis is a test file.');
  const [watching, setWatching] = useState(false);

  const addResult = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const result = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
    setResults((prev) => [...prev, result]);
    console.log(result);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test functions
  const testRequestPermission = async () => {
    try {
      const granted = await requestPathPermission(testPath);
      addResult(`✅ Permission granted: ${granted}`, { path: testPath });
    } catch (error) {
      addResult(`❌ Permission error: ${error}`, { error: String(error) });
    }
  };

  const testAddAllowedPath = async () => {
    try {
      await addAllowedPath(testPath);
      addResult(`✅ Added allowed path: ${testPath}`);
    } catch (error) {
      addResult(`❌ Add allowed path error: ${error}`, { error: String(error) });
    }
  };

  const testGetAllowedPaths = async () => {
    try {
      const paths = await getAllowedPaths();
      addResult(`✅ Allowed paths:`, paths);
    } catch (error) {
      addResult(`❌ Get allowed paths error: ${error}`, { error: String(error) });
    }
  };

  const testWriteFile = async () => {
    try {
      await writeFile({
        path: testFile,
        content: fileContent,
        createIfNotExists: true,
        backup: false,
      });
      addResult(`✅ File written: ${testFile}`);
    } catch (error) {
      addResult(`❌ Write file error: ${error}`, { error: String(error) });
    }
  };

  const testReadFile = async () => {
    try {
      const result: FileReadResult = await readFile(testFile);
      addResult(`✅ File read:`, {
        content: result.content.substring(0, 100) + (result.content.length > 100 ? '...' : ''),
        lineCount: result.lineCount,
        size: result.size,
        encoding: result.encoding,
      });
    } catch (error) {
      addResult(`❌ Read file error: ${error}`, { error: String(error) });
    }
  };

  const testDeleteFile = async () => {
    try {
      await deleteFile(testFile);
      addResult(`✅ File deleted: ${testFile}`);
    } catch (error) {
      addResult(`❌ Delete file error: ${error}`, { error: String(error) });
    }
  };

  const testListDirectory = async () => {
    try {
      const entries: DirectoryEntry[] = await listDirectory(testPath);
      addResult(`✅ Directory listed (${entries.length} entries):`, entries);
    } catch (error) {
      addResult(`❌ List directory error: ${error}`, { error: String(error) });
    }
  };

  const testCreateDirectory = async () => {
    try {
      const newDir = `${testPath}\\subfolder`;
      await createDirectory(newDir);
      addResult(`✅ Directory created: ${newDir}`);
    } catch (error) {
      addResult(`❌ Create directory error: ${error}`, { error: String(error) });
    }
  };

  const testDeleteDirectory = async () => {
    try {
      const dirToDelete = `${testPath}\\subfolder`;
      await deleteDirectory(dirToDelete);
      addResult(`✅ Directory deleted: ${dirToDelete}`);
    } catch (error) {
      addResult(`❌ Delete directory error: ${error}`, { error: String(error) });
    }
  };

  const testGetFileMetadata = async () => {
    try {
      const metadata: FileMetadata = await getFileMetadata(testFile);
      addResult(`✅ File metadata:`, metadata);
    } catch (error) {
      addResult(`❌ Get metadata error: ${error}`, { error: String(error) });
    }
  };

  const testFileExists = async () => {
    try {
      const exists = await fileExists(testFile);
      addResult(`✅ File exists: ${exists}`, { path: testFile });
    } catch (error) {
      addResult(`❌ File exists check error: ${error}`, { error: String(error) });
    }
  };

  const testSecurityBlock = async () => {
    try {
      await readFile('C:\\Windows\\System32\\config\\sam');
      addResult(`❌ Security failed! Should have blocked this path.`);
    } catch (error) {
      addResult(`✅ Security worked! Blocked unauthorized access: ${error}`);
    }
  };

  const testPathTraversal = async () => {
    try {
      await readFile('..\\..\\..\\Windows\\System32');
      addResult(`❌ Security failed! Should have blocked path traversal.`);
    } catch (error) {
      addResult(`✅ Path traversal blocked: ${error}`);
    }
  };

  const testWatchFile = async () => {
    try {
      if (!watching) {
        // Set up event listeners
        await setupFileWatchListeners({
          onCreated: (event) => {
            if (event.type === 'created') {
              addResult(`📁 File created: ${event.path}`);
            }
          },
          onModified: (event) => {
            if (event.type === 'modified') {
              addResult(`✏️ File modified: ${event.path}`);
            }
          },
          onDeleted: (event) => {
            if (event.type === 'deleted') {
              addResult(`🗑️ File deleted: ${event.path}`);
            }
          },
          onRenamed: (event) => {
            if (event.type === 'renamed') {
              addResult(`🔄 File renamed: ${event.old} → ${event.new}`);
            }
          },
        });

        await watchFile(testFile);
        setWatching(true);
        addResult(`✅ Watching file: ${testFile}`);
        addResult(`💡 Now modify the file externally to see events!`);
      } else {
        addResult(`ℹ️ Already watching file`);
      }
    } catch (error) {
      addResult(`❌ Watch file error: ${error}`, { error: String(error) });
    }
  };

  const testWatchDirectory = async () => {
    try {
      await watchDirectory(testPath, true);
      addResult(`✅ Watching directory (recursive): ${testPath}`);
      addResult(`💡 Now create/modify files in this directory to see events!`);
    } catch (error) {
      addResult(`❌ Watch directory error: ${error}`, { error: String(error) });
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('🚀 Starting comprehensive file system tests...\n');

    // Setup
    addResult('--- Setup Phase ---');
    await testRequestPermission();
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Create test directory if it doesn't exist
    try {
      await createDirectory(testPath);
      addResult(`✅ Test directory created/verified: ${testPath}`);
    } catch (error) {
      addResult(`⚠️ Directory creation: ${error} (may already exist)`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Basic operations
    addResult('\n--- Basic File Operations ---');
    await testWriteFile();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testReadFile();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testGetFileMetadata();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testFileExists();

    // Directory operations
    addResult('\n--- Directory Operations ---');
    await testListDirectory();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testCreateDirectory();
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Re-request permission for subdirectory operations
    await testRequestPermission();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testListDirectory();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testDeleteDirectory();

    // Security tests
    addResult('\n--- Security Tests ---');
    await testSecurityBlock();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testPathTraversal();

    // File watching
    addResult('\n--- File Watching ---');
    await testWatchFile();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testWatchDirectory();

    addResult('\n✅ All tests completed!');
  };

  return (
    <div className="h-full w-full flex flex-col bg-panel p-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">File System Test Panel</h2>
        <button
          onClick={clearResults}
          className="px-3 py-1 bg-accent-secondary text-accent-text rounded hover:bg-accent-hover"
        >
          Clear Results
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={testPath}
          onChange={(e) => setTestPath(e.target.value)}
          placeholder="Test directory path"
          className="flex-1 min-w-64 px-3 py-2 border border-color rounded bg-panel text-primary"
        />
        <input
          type="text"
          value={testFile}
          onChange={(e) => setTestFile(e.target.value)}
          placeholder="Test file path"
          className="flex-1 min-w-64 px-3 py-2 border border-color rounded bg-panel text-primary"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover font-semibold"
        >
          🚀 Run All Tests
        </button>
        <button
          onClick={testRequestPermission}
          className="px-3 py-2 bg-accent-secondary text-accent-text rounded hover:bg-accent-hover"
        >
          Request Permission
        </button>
        <button
          onClick={testWriteFile}
          className="px-3 py-2 bg-accent-secondary text-accent-text rounded hover:bg-accent-hover"
        >
          Write File
        </button>
        <button
          onClick={testReadFile}
          className="px-3 py-2 bg-accent-secondary text-accent-text rounded hover:bg-accent-hover"
        >
          Read File
        </button>
        <button
          onClick={testListDirectory}
          className="px-3 py-2 bg-accent-secondary text-accent-text rounded hover:bg-accent-hover"
        >
          List Directory
        </button>
        <button
          onClick={testSecurityBlock}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Test Security
        </button>
        <button
          onClick={testWatchFile}
          className="px-3 py-2 bg-accent-secondary text-accent-text rounded hover:bg-accent-hover"
        >
          Watch File
        </button>
      </div>

      <div className="flex-1 overflow-auto border border-color rounded bg-main p-4">
        <pre className="text-sm text-secondary font-mono whitespace-pre-wrap">
          {results.length === 0 ? 'No test results yet. Click "Run All Tests" to start.' : results.join('\n\n')}
        </pre>
      </div>
    </div>
  );
};

