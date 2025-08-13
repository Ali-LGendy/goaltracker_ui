import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { GoalsService, Goal } from '../../services/goals';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './goals.html',
  styleUrls: ['./goals.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  loading = true;
  creating = false;
  editingGoalId: number | null = null;

  goalForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private goalsService: GoalsService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.goalForm = this.fb.group({
      title: this.fb.nonNullable.control('', Validators.required),
      description: this.fb.nonNullable.control(''),
      parentId: this.fb.control<number | null>(null)
    });

    this.editForm = this.fb.group({
      title: this.fb.nonNullable.control('', Validators.required),
      description: this.fb.nonNullable.control('')
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

  createGoal() {
    if (this.goalForm.invalid) return;
    this.creating = true;

    this.goalsService.createGoal(this.goalForm.getRawValue()).subscribe({
      next: () => {
        this.goalForm.reset({ title: '', description: '', parentId: null });
        this.creating = false;
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
      description: goal.description || ''
    });
  }

  saveEdit(goalId: number) {
    if (this.editForm.invalid) return;

    this.goalsService.updateGoal(goalId, this.editForm.getRawValue()).subscribe({
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
    if (!confirm('Are you sure you want to delete this goal?')) return;

    this.goalsService.deleteGoal(id).subscribe({
      next: () => this.loadGoals(),
      error: (err) => console.error('Delete failed', err)
    });
  }

  getAllGoalsFlat(goals: Goal[]): Goal[] {
    let result: Goal[] = [];
    for (let g of goals) {
      result.push(g);
      if (g.children?.length) {
        result = result.concat(this.getAllGoalsFlat(g.children));
      }
    }
    return result;
  }
}
