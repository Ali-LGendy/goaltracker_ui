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

  createGoal(data: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, data);
  }

  updateGoal(id: number, data: Partial<Goal>): Observable<Goal> {
    return this.http.patch<Goal>(`${this.apiUrl}/${id}`, data);
  }

  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
