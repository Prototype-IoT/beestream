import { Component,
         AfterViewInit,
         Output,
         Input,
         EventEmitter,
         OnChanges,
         SimpleChange } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ChartComponent } from '../chart.interface.component';
import * as c3 from 'c3';
require('../../../c3.styles.css');

/*DashboardComponent
* This component will be our dashboard for beemon analytics.
*/
@Component({
  selector: 'rmslinear-chart',
  template: require('./rmslinearchart.template.html'),
  styles: [ '../../../c3.styles.css' ]
})
export class RMSLinearChartComponent implements OnChanges, ChartComponent, AfterViewInit {

  @Output() public updateFocusedDate: EventEmitter<Date> = new EventEmitter<Date>();
  @Input() private focused: any;
  private chart:any;
  private showChart: boolean;
  private columns: Array<any> = [];
  private xs: any = {};
  requiredDataSet: any = {audio: ['AverageRMSLinear', 'UTCStartDate', 'UTCEndDate']};

  /*ngAfterViewInit()
  * This method overrides the ngAfterViewInit method to add functionality,
  * namely, we'll have to set up our c3 charts here.
  */
  public ngAfterViewInit() {
    this.chart = c3.generate({
      bindto: '#rmslinear-chart',
      data: {
        xs: {},
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
        columns: [],
        type: 'scatter',
        onmouseover: (elemData) => {
          this.updateFocusedDate.emit(elemData);
        },
        onclick: (elemData) => {
          this.updateFocusedDate.emit(elemData);
        },
        selection: {
          enabled: true,
          multiple: false
        }
      },
      axis: {
        x: {
          label: 'Datetime',
          type: 'timeseries',
          tick: {
            rotate: 60,
            fit: true,
            multiline: true,
            format: '%Y-%m-%d %H:%M:%S'
          }
        },
        y: {
          label: 'RMS Linear'
        }
      }
    });
  }

  /*ngOnChanges
  * This method handles variable changes.
  * Whenever the focused data point change, change our selected point.
  *
  * @params:
  *   changes: SimpleChange - an array of key:value pairs holding the input
  *                           variable changes.
  */
  public ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes['focused'].currentValue != null && this.showChart) {
      let focusChanges = changes['focused'].currentValue;
      let x = this.chart.x()[focusChanges.name];
      let minDiff = Infinity;
      let minIndex = 0;
      for (let i = 0; i < x.length; i++) {
        let diff = Math.abs(x[i] - focusChanges.x);
        if (diff < minDiff) {
          minDiff = diff;
          minIndex = i;
        }
      }
      this.chart.select([focusChanges.name], [minIndex], true);
    }
  }

  /*updateChartData()
  * This method will update all chart data with our new data.  May need to be
  * specialized to deal with special types of charts later!
  */
  public updateData(res: any, dataKey: string,
                    datesKey: string, aggregateMethod: string,
                    unchartedHives: Array<string>) {
    //Get a list of hives that aren't currently charted and their names with
    //'dates' appended to cover the dates datasets.  This is used to remove
    //previously charted datasets later.
    let unusedDataSets = [];
    for (let hive of unchartedHives) {
      unusedDataSets.push(hive);
      unusedDataSets.push(hive + "Dates");
    }

    //Process data by appending a hivename or hivename with date appended.
    let data = { video: {}, audio: {
      UTCStartDate: [],
      AverageRMSLinear: []
    } };
    for (let field in res.audio) {
      if (field.includes('Date')) {
        (data['audio'])[field] = [datesKey].concat(res.audio[field]);
      }
      else if (field != 'HiveName') {
        (data['audio'])[field] = [dataKey].concat(res.audio[field]);
      }
    }

    //Remove any datasets that shouldn't be charted anymore, or that will be
    //replaced by this update.
    let newCols = [];
    for (let index = 0; index < this.columns.length; index++) {
      if (!((this.columns[index][0] === dataKey)
          || (this.columns[index][0] === datesKey)
          || (unusedDataSets.includes(this.columns[index][0])))) {
        newCols.push(this.columns[index]);
      }
    }
    this.columns = newCols;

    //push new datasets
    this.columns.push(data.audio.UTCStartDate);
    this.columns.push(data.audio.AverageRMSLinear);

    //Load our new XS key-value pair
    let newXS = {};
    for (let pair in this.xs) {
      if (!((unusedDataSets.includes(pair)) || (pair === dataKey))) {
        newXS[pair] = pair + "Dates";
      }
    }
    newXS[dataKey] = datesKey;
    this.xs = newXS;


    this.showChart = false;

    //Re-generate and reload the chart.
    //This portion should be able to be done using this.chart.load() but
    //issues with c3 cause the chart to improperly regenerate without
    //re-rendering and removing unloaded datasets.  Specifically,
    //this.chart.load successfully loads new datasets and unloads requested
    //datasets, but the re-render process doesn't un-render removed datasets.
    this.chart = c3.generate({
      bindto: '#rmslinear-chart',
      data: {
        xs: this.xs,
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
        columns: this.columns,
        type: 'scatter',
        onmouseover: (elemData) => {
          this.updateFocusedDate.emit(elemData);
        },
        onclick: (elemData) => {
          this.updateFocusedDate.emit(elemData);
        },
        selection: {
          enabled: true,
          multiple: false
        }
      },
      axis: {
        x: {
          label: 'Datetime',
          type: 'timeseries',
          tick: {
            rotate: 60,
            fit: true,
            multiline: true,
            format: '%Y-%m-%d %H:%M:%S'
          }
        },
        y: {
          label: 'RMS'
        }
      }
    });

    //update the chart's key with the method of aggregation
    if (aggregateMethod) {
      this.chart.axis.labels({y: 'RMS' + aggregateMethod});
    }

    //show the chart!
    this.showChart = true;
  }

  /*requiredDataSets
  * returns a list of required data sets.
  */
  public requiredDataSets(): { audio: [], video: [] } {
    return this.requiredDataSet;
  }
}
