# Developer Guide - Natty Gas Lab LIMS

## Quick Start

This guide helps developers understand the application structure and how to add new features.

---

## 📂 Project Structure

```
src/
├── services/           # Business logic and data operations
├── components/         # Reusable UI components
│   ├── shared/         # Cross-feature components
│   └── [feature]/      # Feature-specific components
├── pages/              # Main page orchestrators
└── utils/              # Helper functions
```

---

## 🛠️ Adding a New Feature

Follow these 5 steps to add a new feature:

### 1. Create Service File

**File**: `/services/[featureName]Service.ts`

```typescript
export interface Entity {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  // ... other fields
}

const mockData: Entity[] = [
  // Mock data here
];

export const entityService = {
  getEntities: (): Entity[] => {
    return mockData;
  },

  addEntity: (entity: Entity): Entity => {
    // Add logic
    return entity;
  },

  updateEntity: (id: string, entity: Entity): Entity => {
    // Update logic
    return entity;
  },

  deleteEntity: (id: string): boolean => {
    // Delete logic
    return true;
  },

  searchEntities: (entities: Entity[], searchTerm: string): Entity[] => {
    return entities.filter(e =>
      Object.values(e).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  validateEntity: (entity: Partial<Entity>): { valid: boolean; error?: string } => {
    if (!entity.name || entity.name.trim() === "") {
      return { valid: false, error: "Name is required" };
    }
    return { valid: true };
  },
};
```

### 2. Create Component Files

**Directory**: `/components/[featureName]/`

#### Table Component
**File**: `[Name]Table.tsx`
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Entity } from "../../services/entityService";

interface EntityTableProps {
  entities: Entity[];
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

export function EntityTable({ entities, onEdit, onDelete }: EntityTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => (
            <TableRow key={entity.id}>
              <TableCell>{entity.name}</TableCell>
              <TableCell>{entity.status}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(entity)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(entity)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### Form Component
**File**: `[Name]Form.tsx`
```typescript
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ActiveSelect } from "../shared/ActiveSelect";
import { Entity } from "../../services/entityService";

interface EntityFormProps {
  entity: Partial<Entity>;
  onChange: (entity: Partial<Entity>) => void;
}

export function EntityForm({ entity, onChange }: EntityFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={entity.name || ""}
          onChange={(e) => onChange({ ...entity, name: e.target.value })}
          placeholder="Enter name"
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <ActiveSelect
          value={entity.status || "Active"}
          onValueChange={(value) => onChange({ ...entity, status: value })}
        />
      </div>
    </div>
  );
}
```

#### Add Dialog
**File**: `Add[Name]Dialog.tsx`
```typescript
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Entity } from "../../services/entityService";
import { EntityForm } from "./EntityForm";

interface AddEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (entity: Partial<Entity>) => void;
}

export function AddEntityDialog({ open, onOpenChange, onAdd }: AddEntityDialogProps) {
  const [entity, setEntity] = useState<Partial<Entity>>({
    name: "",
    status: "Active",
  });

  const handleAdd = () => {
    onAdd(entity);
    setEntity({ name: "", status: "Active" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Entity</DialogTitle>
        </DialogHeader>
        <EntityForm entity={entity} onChange={setEntity} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Create Page File

**File**: `/pages/[Name].tsx`

```typescript
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Entity, entityService } from "../services/entityService";
import { SearchBar } from "../components/shared/SearchBar";
import { EntityTable } from "../components/entity/EntityTable";
import { AddEntityDialog } from "../components/entity/AddEntityDialog";
import { EditEntityDialog } from "../components/entity/EditEntityDialog";
import { DeleteEntityDialog } from "../components/entity/DeleteEntityDialog";

export function EntityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entities, setEntities] = useState<Entity[]>(entityService.getEntities());

  const filteredEntities = entityService.searchEntities(entities, searchTerm);

  const handleAdd = (entity: Partial<Entity>) => {
    const validation = entityService.validateEntity(entity);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const newEntity = entityService.addEntity(entity as Entity);
    setEntities([...entities, newEntity]);
    toast.success("Entity added successfully");
  };

  const handleEdit = (entity: Partial<Entity>) => {
    if (!selectedEntity) return;

    const validation = entityService.validateEntity(entity);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const updated = entityService.updateEntity(selectedEntity.id, entity as Entity);
    setEntities(entities.map(e => e.id === updated.id ? updated : e));
    toast.success("Entity updated successfully");
  };

  const handleDelete = () => {
    if (!selectedEntity) return;

    entityService.deleteEntity(selectedEntity.id);
    setEntities(entities.filter(e => e.id !== selectedEntity.id));
    toast.success("Entity deleted successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
          </div>

          <EntityTable
            entities={filteredEntities}
            onEdit={(entity) => {
              setSelectedEntity(entity);
              setIsEditDialogOpen(true);
            }}
            onDelete={(entity) => {
              setSelectedEntity(entity);
              setIsDeleteDialogOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <AddEntityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAdd}
      />

      <EditEntityDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        entity={selectedEntity}
        onEdit={handleEdit}
      />

      <DeleteEntityDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        entityName={selectedEntity?.name || ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
```

### 4. Update App.tsx

```typescript
import { EntityPage } from "./pages/Entity";

// In the switch statement:
case "entity":
  return <EntityPage />;
```

### 5. Update Sidebar

Add menu item in `/components/Sidebar.tsx`:

```typescript
const menuItems: MenuItem[] = [
  { id: "entity", label: "Entities", icon: <Icon />, section: "master" },
  // ... other items
];
```

---

## 🔧 Common Patterns

### Using Shared Components

```typescript
// Search functionality
import { SearchBar } from "../components/shared/SearchBar";
<SearchBar value={searchTerm} onChange={setSearchTerm} />

// Active/Inactive badge
import { ActiveBadge } from "../components/shared/ActiveBadge";
<ActiveBadge active={entity.status === "Active"} />

// Active/Inactive dropdown
import { ActiveSelect } from "../components/shared/ActiveSelect";
<ActiveSelect value={status} onValueChange={setStatus} />
```

### Form Validation

```typescript
const validation = entityService.validateEntity(entity);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}
```

### Toast Notifications

```typescript
import { toast } from "sonner@2.0.3";

toast.success("Operation completed");
toast.error("Operation failed");
toast.info("Information message");
```

---

## 📊 Service Best Practices

1. **Always use TypeScript interfaces** for type safety
2. **Validate data** before operations
3. **Return meaningful errors** in validation results
4. **Keep services pure** - no UI logic
5. **Use descriptive method names** - `getEntities`, not `fetch`
6. **Mock data in services** until backend is ready

---

## 🎨 UI Component Best Practices

1. **Single responsibility** - each component does one thing
2. **Accept props** instead of managing state
3. **Use Tailwind classes** for styling
4. **Use Lucide icons** for consistency
5. **Make components reusable** across features

---

## 🧪 Testing (Future)

The architecture is ready for testing:

```typescript
// Service test
describe('entityService', () => {
  it('should validate entity correctly', () => {
    const result = entityService.validateEntity({ name: '' });
    expect(result.valid).toBe(false);
  });
});

// Component test
describe('EntityTable', () => {
  it('should render entities', () => {
    render(<EntityTable entities={mockEntities} />);
    expect(screen.getByText('Entity 1')).toBeInTheDocument();
  });
});
```

---

## 🚀 Tips for Success

1. **Follow the pattern** - consistency is key
2. **Reuse components** - check shared/ first
3. **Keep it simple** - don't over-engineer
4. **Test as you go** - verify each component works
5. **Document complex logic** - help future developers

---

## 📚 Resources

- **UI Components**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **State**: React useState/useEffect
- **Forms**: Controlled components

---

## 🆘 Common Issues

### Issue: Type errors
**Solution**: Always define interfaces in service files

### Issue: Component not updating
**Solution**: Ensure state is properly managed in page component

### Issue: Search not working
**Solution**: Use the searchEntities method from service

### Issue: Toast not appearing
**Solution**: Verify Toaster is in App.tsx and correct import

---

## 📞 Need Help?

1. Check existing components for examples
2. Review service file for available methods
3. Look at similar features for patterns
4. Check RESTRUCTURING_COMPLETE.md for architecture details

---

**Remember**: Consistency beats perfection. Follow the established patterns and the codebase will remain clean and maintainable! 🎯
