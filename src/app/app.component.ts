import {Component} from '@angular/core';
import {NodeDataService} from './node-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  coreAddress: String = '107.100.76';
  depth: Number = 5;
  limit: Number = 25;

  // chart vars
  view: any;
  colorScheme = {
    domain: ['#222222', '#333333', '#444444', '#555555', '#666666', '#777777']
  };
  showLegend = false;
  legendTitle = 'dummy data';

  nodes: any = [];

  links: any = [];

  constructor(private nodeData: NodeDataService) {
    // Observe `updateString$` for change announcements.
    nodeData.updateString$.subscribe(
      res => this.updateData()
    );

    this.updateData();
  }

  updateData(): void {

    const req = {
      coreAddress: this.coreAddress,
      depth: this.depth,
      limit: this.limit
    };

    this.nodeData.getNodes(req).subscribe(result => {

      console.log('result from server:', result);

      this.nodes = [{'value': '111.222.111'},
        {'value': '122.211.122'},
        {'value': '133.133.133'}
      ];

      this.links = [{
        source: '111.222.111', target: '122.211.122'
      }];


      // this.nodes = result.nodeValues;
      // this.links = result.nodeLinks;

    });
  }

  handleClick_randomize(): void {

    // create a random address
    this.coreAddress = Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);

  }

  handleClick_getData(): void {
    this.updateData();
  }

}
