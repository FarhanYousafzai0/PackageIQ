import React, { useState, useEffect } from 'react';
import { Clipboard, Check, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const InstallCommands = ({ packageName }) => {
  const [activeTab, setActiveTab] = useState('npm');
  const [codeExample, setCodeExample] = useState('');
  const [loading, setLoading] = useState(true);

  const packageManagers = {
    npm: { command: `npm install ${packageName}`, label: 'npm' },
    yarn: { command: `yarn add ${packageName}`, label: 'yarn' },
    pnpm: { command: `pnpm add ${packageName}`, label: 'pnpm' },
    bun: { command: `bun add ${packageName}`, label: 'bun' },
  };

  useEffect(() => {
    const fetchReadme = async () => {
      setLoading(true);
      try {
        const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
        const npmUrl = `https://registry.npmjs.org/${packageName}`;
        
        let response;
        try {
          response = await axios.get(npmUrl, { timeout: 15000 });
        } catch (corsError) {
          response = await axios.get(`${CORS_PROXY}${encodeURIComponent(npmUrl)}`, { timeout: 15000 });
        }
        
        const readmeContent = response.data.readme || '';
        const codeBlockMatch = readmeContent.match(/```(?:\w+)?\n([\s\S]*?)```/);
        setCodeExample(codeBlockMatch?.[1]?.trim() || '');
      } catch {
        setCodeExample('');
      } finally {
        setLoading(false);
      }
    };

    if (packageName) fetchReadme();
  }, [packageName]);

  const handleCopy = async () => {
    const command = packageManagers[activeTab].command;
    try {
      await navigator.clipboard.writeText(command);
      toast.success('Copied to clipboard!', {
        description: command,
        duration: 2000,
      });
    } catch {
      toast.error('Failed to copy command');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-200">Install</h3>
      </div>

      <div className="flex gap-2 mb-4">
        {Object.entries(packageManagers).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 p-3 bg-gray-950 rounded-lg border border-gray-800">
        <code className="flex-1 font-mono text-green-400 text-sm overflow-x-auto">
          {packageManagers[activeTab].command}
        </code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Clipboard className="w-4 h-4" />
          <span className="text-sm">Copy</span>
        </button>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Usage Example</h4>
        
        {loading ? (
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        ) : codeExample ? (
          <pre className="bg-gray-950 text-gray-300 font-mono text-xs p-3 rounded-lg overflow-x-auto border border-gray-800 whitespace-pre-wrap">
            <code>{codeExample}</code>
          </pre>
        ) : (
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800 text-center">
            <p className="text-gray-500 text-sm">No usage example available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallCommands;
