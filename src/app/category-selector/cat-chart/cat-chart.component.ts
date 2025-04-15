import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { ChartDataService } from '../../services/chart-data.service';

@Component({
  standalone: true,
  selector: 'app-cat-chart',
  templateUrl: './cat-chart.component.html',
  styleUrl: './cat-chart.component.scss',
})
export class CatChartComponent implements OnInit, OnChanges,AfterViewInit {
  @Input() borrowedBooksByCategory: { [key: string]: number } = {};
  @Input() availableBooksByCategory: { [key: string]: number } = {};
  private chart: Chart | null = null;

  constructor(
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private chartDataService: ChartDataService
  ) {
    // Inject HttpClient
    Chart.register(...registerables);
  }

  ngOnInit() {
    // this.loadChartData();
    this.chartDataService.borrowedBooksByCategory$.subscribe((borrowed) => {
      this.loadChartData();
    });

    this.chartDataService.availableBooksByCategory$.subscribe((available) => {
      this.loadChartData();
    });
  }

  ngAfterViewInit() {
    this.loadChartData(); // Initialize the chart after the view is fully loaded
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['borrowedBooksByCategory']) {
      this.loadChartData();
    }
  }

  loadChartData() {
    //
    const ctx = document.getElementById('borrowedChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas element not found!');
      return;
    }

    this.http
      .get<{ categories: string[] }>('/assets/categories.json')
      .subscribe((data) => {
        const categories = data.categories;

        const availableTrends = JSON.parse(
          localStorage.getItem('available_trends') || '{}'
        );
        const borrowedTrends = JSON.parse(
          localStorage.getItem('borrowed_trends') || '{}'
        );

        categories.forEach((category) => {
          if (!(category in availableTrends)) {
            availableTrends[category] = 100;
          }
          if (!(category in borrowedTrends)) {
            borrowedTrends[category] = 0;
          }
        });

        localStorage.setItem(
          'available_trends',
          JSON.stringify(availableTrends)
        );
        localStorage.setItem('borrowed_trends', JSON.stringify(borrowedTrends));

        const availableCounts = categories.map(
          (category) => availableTrends[category]
        );
        const borrowedCounts = categories.map(
          (category) => borrowedTrends[category]
        );

        if (this.chart) {
          this.chart.destroy();
        }
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
              {
                label: 'Available Books',
                data: availableCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
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
      });
  }
}
