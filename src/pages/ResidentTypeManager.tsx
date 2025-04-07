
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { X, Plus, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

type Category = {
  id: number;
  name: string;
  types: {
    id: number;
    name: string;
  }[];
};

export default function ResidentTypeManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('resident_categories')
        .select('id, name');
      
      if (categoriesError) throw categoriesError;
      
      const categoriesWithTypes: Category[] = [];
      
      // For each category, fetch its types
      for (const category of categoriesData || []) {
        const { data: typesData, error: typesError } = await supabase
          .from('resident_types')
          .select('id, name')
          .eq('category_id', category.id);
          
        if (typesError) throw typesError;
        
        categoriesWithTypes.push({
          id: category.id,
          name: category.name,
          types: typesData || []
        });
      }
      
      setCategories(categoriesWithTypes);
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resident categories and types',
        variant: 'destructive',
      });
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, [toast]);
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('resident_categories')
        .insert({ name: newCategoryName.trim() })
        .select();
        
      if (error) throw error;
      
      setNewCategoryName('');
      await fetchCategories(); // Refresh data
      
      toast({
        title: 'Category added',
        description: `${newCategoryName} has been added successfully`
      });
      
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };
  
  const handleAddType = async () => {
    if (!newTypeName.trim() || !selectedCategory) return;
    
    try {
      const { error } = await supabase
        .from('resident_types')
        .insert({
          name: newTypeName.trim(),
          category_id: selectedCategory
        });
        
      if (error) throw error;
      
      setNewTypeName('');
      await fetchCategories(); // Refresh data
      
      toast({
        title: 'Type added',
        description: `${newTypeName} has been added successfully`
      });
      
    } catch (error) {
      console.error('Error adding type:', error);
      toast({
        title: 'Error',
        description: 'Failed to add type',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      // First delete all types associated with this category
      await supabase
        .from('resident_types')
        .delete()
        .eq('category_id', categoryId);
      
      // Then delete the category
      const { error } = await supabase
        .from('resident_categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      
      await fetchCategories(); // Refresh data
      
      toast({
        title: 'Category deleted',
        description: 'Category and its types have been removed'
      });
      
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteType = async (typeId: number) => {
    try {
      const { error } = await supabase
        .from('resident_types')
        .delete()
        .eq('id', typeId);
        
      if (error) throw error;
      
      await fetchCategories(); // Refresh data
      
      toast({
        title: 'Type deleted',
        description: 'Type has been removed successfully'
      });
      
    } catch (error) {
      console.error('Error deleting type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete type',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Manage Types of Residents</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-medium">Add New Category</h3>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="max-w-xs"
            />
            <Button 
              onClick={handleAddCategory}
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead>Types</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {category.types.map((type) => (
                      <div 
                        key={type.id}
                        className="inline-flex items-center bg-gray-100 rounded-md px-2 py-1"
                      >
                        {type.name}
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Type
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Type to {category.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder="New type name"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleAddType}
                            className="bg-sanctuary-green hover:bg-sanctuary-light-green"
                          >
                            Add Type
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => fetchCategories()}>
            Refresh List
          </Button>
        </div>
      </div>
    </div>
  );
}
