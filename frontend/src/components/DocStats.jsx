import { FilePlus, BrainCog, Database } from 'lucide-react';

const DocStats = ({ aiGenerated = 0, astGenerated = 0, totalFiles = 0, stats }) => {
  // Support both direct props and stats object
  if (stats) {
    aiGenerated = stats.aiGenerated || 0;
    astGenerated = stats.astGenerated || 0;
    totalFiles = stats.totalFiles || 0;
  }
  return (
    <div>
      <h3 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white">Documentation Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 p-5 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow border border-blue-200 dark:border-blue-800/30">
          <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-700/50 mr-4">
            <BrainCog className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Generated</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{aiGenerated}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/30 p-5 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow border border-green-200 dark:border-green-800/30">
          <div className="p-3 rounded-full bg-green-200 dark:bg-green-700/50 mr-4">
            <Database className="w-8 h-8 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AST Generated</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{astGenerated}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/30 p-5 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow border border-purple-200 dark:border-purple-800/30">
          <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-700/50 mr-4">
            <FilePlus className="w-8 h-8 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Files Processed</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalFiles}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocStats;
