import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { GoalsService, Goal, ReorderGoalsDto } from '../../services/goals';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './goals.html',
  styleUrls: ['./goals.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  loading = true;
  creating = false;
  editingGoalId: number | null = null;
  showCreateForm = false;

  goalForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private goalsService: GoalsService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      deadline: [''],
      isPublic: [false],
      parentId: [null],
      order: [0]
    });

    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      deadline: [''],
      isPublic: [false],
      parentId: [null]
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoals();
    }
  }

  loadGoals() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setTimeout(() => this.loadGoals(), 100);
      return;
    }

    this.loading = true;
    this.goalsService.getGoals().subscribe({
      next: (data) => {
        this.goals = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching goals', err);
        this.loading = false;
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.goalForm.reset({ title: '', description: '', deadline: '', isPublic: false, parentId: null, order: 0 });
    }
  }

  createGoal() {
    if (this.goalForm.invalid) return;
    this.creating = true;

    const formData = { ...this.goalForm.getRawValue() };

    if (formData.parentId) {
      formData.parentId = +formData.parentId;
    }

    this.goalsService.createGoal(formData).subscribe({
      next: () => {
        this.goalForm.reset({ title: '', description: '', deadline: '', isPublic: false, parentId: null, order: 0 });
        this.creating = false;
        this.showCreateForm = false;
        this.loadGoals();
      },
      error: (err) => {
        console.error('Create failed', err);
        this.creating = false;
      }
    });
  }

  startEdit(goal: Goal) {
    this.editingGoalId = goal.id;
    this.editForm.patchValue({
      title: goal.title,
      description: goal.description || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      isPublic: goal.isPublic || false,
      parentId: goal.parentId || null
    });
  }

  saveEdit(goalId: number) {
    if (this.editForm.invalid) return;

    const formData = { ...this.editForm.getRawValue() };

    if (formData.parentId) {
      formData.parentId = +formData.parentId;
    }

    this.goalsService.updateGoal(goalId, formData).subscribe({
      next: () => {
        this.editingGoalId = null;
        this.loadGoals();
      },
      error: (err) => console.error('Update failed', err)
    });
  }

  cancelEdit() {
    this.editingGoalId = null;
  }

  deleteGoal(id: number) {
    if (!confirm('Are you sure you want to delete this goal? This will also delete all its children.')) return;

    this.goalsService.deleteGoal(id).subscribe({
      next: () => this.loadGoals(),
      error: (err) => console.error('Delete failed', err)
    });
  }

  getAllGoalsFlat(goals: Goal[]): Goal[] {
    return this.goalsService.flattenGoals(goals);
  }

  getAvailableParents(goals: Goal[], excludeId?: number): Goal[] {
    const flatGoals = this.getAllGoalsFlat(goals);
    return flatGoals.filter(goal => {
      if (goal.id === excludeId) return false;

      const level = this.goalsService.getGoalLevel(goals, goal.id);
      return level === 0;
    });
  }

  onDrop(event: CdkDragDrop<Goal[]>, parentId: number | null = null) {
    const goals = parentId ? this.findChildrenByParentId(parentId) : this.goals;
    if (!goals) return;

    moveItemInArray(goals, event.previousIndex, event.currentIndex);

    const reorderData: ReorderGoalsDto = {
      goals: goals.map((goal, index) => ({ id: goal.id, order: index })),
      parentId: parentId
    };

    this.goalsService.reorderGoals(reorderData).subscribe({
      next: () => this.loadGoals(),
      error: (err) => console.error('Reorder failed', err)
    });
  }

  private findChildrenByParentId(parentId: number): Goal[] | null {
    const parent = this.goalsService.findGoalById(this.goals, parentId);
    return parent?.children || null;
  }

  togglePublic(goal: Goal) {
    this.goalsService.updateGoal(goal.id, { isPublic: !goal.isPublic }).subscribe({
      next: () => this.loadGoals(),
      error: (err) => console.error('Toggle public failed', err)
    });
  }

  copyPublicLink(goal: Goal) {
    if (!goal.publicId) return;

    const url = `${window.location.origin}/public/${goal.publicId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Public link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this link:', url);
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  isOverdue(deadline?: string): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  }

  getDaysUntilDeadline(deadline?: string): number | null {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getAbsoluteDaysUntilDeadline(deadline?: string): number {
    const days = this.getDaysUntilDeadline(deadline);
    return days ? Math.abs(days) : 0;
  }
}
