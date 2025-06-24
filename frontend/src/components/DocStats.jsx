import { FilePlus, FileText, FolderOpen, TrendingUp } from 'lucide-react';

const DocStats = ({ documentsGenerated = 0, projectsAnalyzed = 0, totalFiles = 0, stats }) => {
  // Support both direct props and stats object
  if (stats) {
    documentsGenerated = stats.documentsGenerated || stats.aiGenerated || 0;
    projectsAnalyzed = stats.projectsAnalyzed || stats.astGenerated || 0;
    totalFiles = stats.totalFiles || 0;
  }
  
  const statsData = [
    {
      label: 'Documents Generated',
      value: documentsGenerated,
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      textColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/50 dark:border-blue-800/30'
    },
    {
      label: 'Projects Analyzed',
      value: projectsAnalyzed,
      icon: FolderOpen,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      textColor: 'text-green-600 dark:text-green-400',
      border: 'border-green-200/50 dark:border-green-800/30'
    },
    {
      label: 'Files Processed',
      value: totalFiles,
      icon: FilePlus,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      textColor: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/50 dark:border-purple-800/30'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Performance Statistics</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Real-time
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={stat.label}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} p-6 rounded-2xl border ${stat.border} hover:shadow-lg hover:scale-105 transition-all duration-300 group`}
            >
              {/* Background decoration */}
              <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.label}</p>
                  <div className="flex items-end space-x-2">
                    <p className={`text-4xl font-bold ${stat.textColor} tabular-nums`}>
                      {stat.value}
                    </p>
                    {stat.value > 0 && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`${stat.iconBg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000`}
                  style={{ width: `${Math.min(stat.value * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary card */}
      {(documentsGenerated > 0 || projectsAnalyzed > 0 || totalFiles > 0) && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Total Processing Activity
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                You've processed {totalFiles} files across {projectsAnalyzed || 'multiple'} projects, 
                generating {documentsGenerated} documentation files.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {documentsGenerated + projectsAnalyzed + totalFiles}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Actions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocStats;
