import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Database, Download, Upload, Trash2, Zap, RefreshCw } from 'lucide-react';
import { 
  getDatabaseStats, 
  exportDatabase, 
  importDatabase,
  clearDatabase,
  optimizeDatabase 
} from '@/lib/database';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';

const DatabaseSettings = () => {
  const [stats, setStats] = useState(getDatabaseStats());
  const [showClearDialog, setShowClearDialog] = useState(false);

  const refreshStats = () => {
    setStats(getDatabaseStats());
    toast.success('Statistics refreshed');
  };

  const handleExport = () => {
    const data = exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yorukaze-pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Database exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const jsonData = event.target?.result as string;
          const success = importDatabase(jsonData);
          if (success) {
            toast.success('Database imported successfully');
            refreshStats();
            setTimeout(() => window.location.reload(), 1000);
          } else {
            toast.error('Failed to import database');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    clearDatabase();
    toast.success('Database cleared successfully');
    refreshStats();
    setShowClearDialog(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleOptimize = () => {
    const result = optimizeDatabase();
    toast.success(`Database optimized! Saved ${result.saved}`);
    refreshStats();
  };

  return (
    <Layout>
      <ParticleBackground variant="snow" />
      
      <div className="space-y-6">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Database Management</h2>
            <p className="text-muted-foreground">View statistics and manage your local database</p>
          </div>
          <Button onClick={refreshStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-lg">Database Size</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.sizeMB} MB</p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.sizeKB} KB total storage
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Collections</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products:</span>
                <span className="font-medium">{stats.collections.inventory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sales:</span>
                <span className="font-medium">{stats.collections.sales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categories:</span>
                <span className="font-medium">{stats.collections.categories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trash:</span>
                <span className="font-medium">{stats.collections.trash}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Image Storage</h3>
            <p className="text-2xl font-bold text-foreground">{stats.images.count}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.images.sizeMB} MB ({stats.images.sizeKB} KB)
            </p>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Database Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </Button>
            
            <Button onClick={handleImport} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Import Backup
            </Button>
            
            <Button onClick={handleOptimize} variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Optimize
            </Button>
            
            <Button 
              onClick={() => setShowClearDialog(true)} 
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* Last Modified */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Last Modified</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(stats.lastModified).map(([key, value]) => (
              <div key={key} className="flex justify-between p-3 bg-muted/50 rounded">
                <span className="capitalize">{key}:</span>
                <span className="text-muted-foreground">
                  {value ? new Date(value).toLocaleString() : 'Never'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Database Version */}
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Database Version:</span>
            <span className="font-mono font-medium">{stats.version}</span>
          </div>
        </Card>
      </div>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Clear All Database?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All products and inventory</li>
                <li>All sales records</li>
                <li>All images</li>
                <li>Trash items</li>
                <li>Custom categories</li>
              </ul>
              <p className="mt-3 font-semibold">This action cannot be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DatabaseSettings;
