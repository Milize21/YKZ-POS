import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getGroups, saveGroups, getInventory, saveInventory } from '@/lib/inventory';
import { toast } from 'sonner';
import { ParticleBackground } from '@/components/ParticleBackground';

const Groups = () => {
  const [groups, setGroups] = useState<string[]>(getGroups());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  // Refresh groups from localStorage periodically for synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedGroups = getGroups();
      if (JSON.stringify(updatedGroups) !== JSON.stringify(groups)) {
        setGroups(updatedGroups);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [groups]);

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroupName.trim()) {
      toast.error('Group name cannot be empty');
      return;
    }

    if (groups.includes(newGroupName.trim())) {
      toast.error('Group already exists');
      return;
    }

    const updated = [...groups, newGroupName.trim()];
    setGroups(updated);
    saveGroups(updated);
    setNewGroupName('');
    setIsAddDialogOpen(false);
    toast.success('Group added successfully');
  };

  const handleEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editGroupName.trim() || !editingGroup) {
      toast.error('Group name cannot be empty');
      return;
    }

    if (groups.includes(editGroupName.trim()) && editGroupName.trim() !== editingGroup) {
      toast.error('Group already exists');
      return;
    }

    // Update group name in groups list
    const updated = groups.map(g => g === editingGroup ? editGroupName.trim() : g);
    setGroups(updated);
    saveGroups(updated);

    // Update group name in all inventory items
    const inventory = getInventory();
    const updatedInventory = inventory.map(item => 
      item.group === editingGroup ? { ...item, group: editGroupName.trim() } : item
    );
    saveInventory(updatedInventory);

    setEditingGroup(null);
    setEditGroupName('');
    setIsEditDialogOpen(false);
    toast.success('Group renamed successfully');
  };

  const openEditDialog = (group: string) => {
    setEditingGroup(group);
    setEditGroupName(group);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (group: string) => {
    // Prevent deletion of protected groups
    if (group === 'Yorukaze' || group === 'All') {
      toast.error(`${group} group cannot be deleted`);
      return;
    }
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGroup = () => {
    if (!deletingGroup) return;
    
    // Extra protection for protected groups
    if (deletingGroup === 'Yorukaze' || deletingGroup === 'All') {
      toast.error(`${deletingGroup} group cannot be deleted`);
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);
      return;
    }

    // Check if any products belong to this group
    const inventory = getInventory();
    const productsInGroup = inventory.filter(item => item.group === deletingGroup);

    if (productsInGroup.length > 0) {
      toast.error(`Cannot delete group with ${productsInGroup.length} products. Reassign them first.`);
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);
      return;
    }

    const updated = groups.filter(g => g !== deletingGroup);
    setGroups(updated);
    saveGroups(updated);
    setIsDeleteDialogOpen(false);
    setDeletingGroup(null);
    toast.success('Group deleted successfully');
  };

  return (
    <Layout>
      {/* Snow Particle Animation */}
      <ParticleBackground variant="snow" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Group Management</h2>
            <p className="text-muted-foreground">Manage product groups</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Yorukaze"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Group
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const isProtected = group === 'Yorukaze' || group === 'All';
                return (
                  <TableRow key={group}>
                    <TableCell className="font-medium">
                      {group}
                      {isProtected && (
                        <span className="ml-2 text-xs text-muted-foreground">(Protected)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(group)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(group)}
                          disabled={isProtected}
                          className={isProtected ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditGroup} className="space-y-4">
            <div>
              <Label htmlFor="editGroupName">Group Name</Label>
              <Input
                id="editGroupName"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Update Group
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingGroup}"? This action cannot be undone.
              Note: Groups with products cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Groups;
