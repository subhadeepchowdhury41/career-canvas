import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, Plus, Save, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { SectionType } from './ContentSection';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ContentSectionData {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
  items?: Array<{ icon?: string; title: string; description: string }>;
}

interface SortableSectionProps {
  section: ContentSectionData;
  onEdit: (section: ContentSectionData) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

function SortableSection({ section, onEdit, onDelete, disabled }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeLabels: Record<SectionType, string> = {
    about: 'About Us',
    culture: 'Life at Company',
    benefits: 'Benefits & Perks',
    values: 'Our Values',
    team: 'Meet the Team',
    video: 'Culture Video',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-2">
        <CardContent className="p-4 flex items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Drag to reorder"
            disabled={disabled}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-medium truncate">{section.title}</h3>
              <Badge variant="secondary" className="shrink-0">
                {typeLabels[section.type]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {section.content}
            </p>
          </div>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(section)}
              disabled={disabled}
              data-testid={`button-edit-section-${section.id}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(section.id)}
              disabled={disabled}
              data-testid={`button-delete-section-${section.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SectionEditor() {
  const params = useParams<{ companySlug: string }>();
  const companySlug = params.companySlug || 'acme-corp';
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sections, setSections] = useState<ContentSectionData[]>([]);
  const [editingSection, setEditingSection] = useState<ContentSectionData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch sections
  const { data, isLoading } = useQuery({
    queryKey: ['sections', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/sections`);
      return response.data.sections as ContentSectionData[];
    },
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (data) {
      setSections(data);
    }
  }, [data]);

  // Create section mutation
  const createMutation = useMutation({
    mutationFn: async (section: Omit<ContentSectionData, 'id' | 'order'>) => {
      const response = await api.post(`/companies/${companySlug}/sections`, {
        ...section,
        order: sections.length,
      });
      return response.data.section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', companySlug] });
      toast({ title: 'Success', description: 'Section created successfully' });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create section',
        variant: 'destructive',
      });
    },
  });

  // Update section mutation
  const updateMutation = useMutation({
    mutationFn: async (section: ContentSectionData) => {
      const response = await api.put(`/companies/${companySlug}/sections/${section.id}`, section);
      return response.data.section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', companySlug] });
      toast({ title: 'Success', description: 'Section updated successfully' });
      setIsDialogOpen(false);
      setEditingSection(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update section',
        variant: 'destructive',
      });
    },
  });

  // Delete section mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${companySlug}/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', companySlug] });
      toast({ title: 'Success', description: 'Section deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete section',
        variant: 'destructive',
      });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      await api.put(`/companies/${companySlug}/sections/reorder`, { items });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: 'Success', description: 'Order saved successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save order',
        variant: 'destructive',
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
      setSaved(false);
    }
  };

  const handleAddSection = () => {
    setEditingSection({
      id: '', // Will be assigned by backend
      type: 'about',
      title: '',
      content: '',
      order: sections.length,
    });
    setIsDialogOpen(true);
  };

  const handleEditSection = (section: ContentSectionData) => {
    setEditingSection(section);
    setIsDialogOpen(true);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveSection = () => {
    if (!editingSection) return;

    if (editingSection.id) {
      updateMutation.mutate(editingSection);
    } else {
      createMutation.mutate(editingSection);
    }
  };

  const handleSaveOrder = () => {
    const items = sections.map((s, index) => ({ id: s.id, order: index }));
    reorderMutation.mutate(items);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Content Sections</h1>
          <p className="text-muted-foreground">Drag to reorder, add or edit sections</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleAddSection} data-testid="button-add-section">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSection?.id ? 'Edit Section' : 'Add Section'}
                </DialogTitle>
                <DialogDescription>
                  Configure the content section for your careers page
                </DialogDescription>
              </DialogHeader>
              
              {editingSection && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="section-type">Section Type</Label>
                    <Select
                      value={editingSection.type}
                      onValueChange={(value: SectionType) => 
                        setEditingSection({ ...editingSection, type: value })
                      }
                    >
                      <SelectTrigger data-testid="select-section-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="about">About Us</SelectItem>
                        <SelectItem value="culture">Life at Company</SelectItem>
                        <SelectItem value="benefits">Benefits & Perks</SelectItem>
                        <SelectItem value="values">Our Values</SelectItem>
                        <SelectItem value="team">Meet the Team</SelectItem>
                        <SelectItem value="video">Culture Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="section-title">Title</Label>
                    <Input
                      id="section-title"
                      value={editingSection.title}
                      onChange={(e) => 
                        setEditingSection({ ...editingSection, title: e.target.value })
                      }
                      placeholder="Section title"
                      data-testid="input-section-title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="section-content">Content</Label>
                    <Textarea
                      id="section-content"
                      value={editingSection.content}
                      onChange={(e) => 
                        setEditingSection({ ...editingSection, content: e.target.value })
                      }
                      placeholder="Section content..."
                      rows={4}
                      data-testid="input-section-content"
                    />
                  </div>

                  {['benefits', 'values', 'team'].includes(editingSection.type) && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label>Section Items</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItems = [...(editingSection.items || [])];
                            newItems.push({ title: '', description: '' });
                            setEditingSection({ ...editingSection, items: newItems });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {(editingSection.items || []).map((item, index) => (
                          <Card key={index}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-3 flex-1">
                                  <div className="grid gap-2">
                                    <Label className="text-xs">Item Title</Label>
                                    <Input
                                      value={item.title}
                                      onChange={(e) => {
                                        const newItems = [...(editingSection.items || [])];
                                        newItems[index] = { ...item, title: e.target.value };
                                        setEditingSection({ ...editingSection, items: newItems });
                                      }}
                                      placeholder="Title"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label className="text-xs">Item Description</Label>
                                    <Textarea
                                      value={item.description}
                                      onChange={(e) => {
                                        const newItems = [...(editingSection.items || [])];
                                        newItems[index] = { ...item, description: e.target.value };
                                        setEditingSection({ ...editingSection, items: newItems });
                                      }}
                                      placeholder="Description"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => {
                                    const newItems = [...(editingSection.items || [])];
                                    newItems.splice(index, 1);
                                    setEditingSection({ ...editingSection, items: newItems });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {(!editingSection.items || editingSection.items.length === 0) && (
                          <div className="text-center p-4 border dashed rounded-lg text-muted-foreground text-sm">
                            No items added yet. Click "Add Item" to start.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveSection} 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-section"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Section'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSaveOrder} disabled={reorderMutation.isPending} data-testid="button-save-sections">
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {reorderMutation.isPending ? 'Saving...' : 'Save Order'}
              </>
            )}
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No sections yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-muted-foreground mb-4">
              Add content sections to showcase your company culture
            </p>
            <Button onClick={handleAddSection} data-testid="button-add-first-section">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onEdit={handleEditSection}
                  onDelete={handleDeleteSection}
                  disabled={deleteMutation.isPending}
                />
              ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
