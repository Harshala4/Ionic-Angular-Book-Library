import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-cat-chart',
  templateUrl: './cat-chart.component.html',
  styleUrl: './cat-chart.component.scss',
})
export class CatChartComponent implements OnInit, OnChanges {
  @Input() borrowedBooksByCategory: { [key: string]: number } = {};
  private chart: Chart | null = null;

  constructor(private cd: ChangeDetectorRef) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['borrowedBooksByCategory']) {
      this.loadChartData();
    }
  }

  loadChartData() {
    const categories = Object.keys(this.borrowedBooksByCategory);
    const borrowedCounts = Object.values(this.borrowedBooksByCategory);

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('borrowedChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Borrowed Books',
            data: borrowedCounts,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#333' } },
        },
        scales: {
          x: { ticks: { color: '#666' }, grid: { color: '#ddd' } },
          y: {
            beginAtZero: true,
            ticks: { color: '#666' },
            grid: { color: '#ddd' },
          },
        },
      },
    });

    this.cd.markForCheck();
  }
}
