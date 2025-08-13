import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Goal {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  isPublic?: boolean;
  parentId?: number | null;
  order?: number;
  publicId?: string;
  children?: Goal[];
  owner?: { id: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalOrderUpdate {
  id: number;
  order: number;
}

export interface ReorderGoalsDto {
  goals: GoalOrderUpdate[];
  parentId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private apiUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.apiUrl);
  }

  getGoal(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/${id}`);
  }

  createGoal(data: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, data);
  }

  updateGoal(id: number, data: Partial<Goal>): Observable<Goal> {
    return this.http.patch<Goal>(`${this.apiUrl}/${id}`, data);
  }

  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reorderGoals(data: ReorderGoalsDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reorder`, data);
  }

  getPublicGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.apiUrl}/public-goals`);
  }

  getPublicGoal(publicId: string): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/public-goals/${publicId}`);
  }

  flattenGoals(goals: Goal[]): Goal[] {
    let result: Goal[] = [];
    for (const goal of goals) {
      result.push(goal);
      if (goal.children?.length) {
        result = result.concat(this.flattenGoals(goal.children));
      }
    }
    return result;
  }

  findGoalById(goals: Goal[], id: number): Goal | null {
    for (const goal of goals) {
      if (goal.id === id) return goal;
      if (goal.children?.length) {
        const found = this.findGoalById(goal.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  getGoalLevel(goals: Goal[], targetId: number, level = 0): number {
    for (const goal of goals) {
      if (goal.id === targetId) return level;
      if (goal.children?.length) {
        const childLevel = this.getGoalLevel(goal.children, targetId, level + 1);
        if (childLevel !== -1) return childLevel;
      }
    }
    return -1;
  }

  canBeParent(goals: Goal[], potentialParentId: number, childId: number): boolean {
    const parentLevel = this.getGoalLevel(goals, potentialParentId);
    return parentLevel < 2;
  }
}
