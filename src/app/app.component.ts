import {Component} from '@angular/core';
import {NodeDataService} from './node-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  coreAddress: String = '107.100.76';
  depth: Number = 4;

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
    };

    this.nodeData.getNodes(req).subscribe(result => {

      console.log('result:', result);

      const nodes = [];

      for (let resultCounter = 0; resultCounter < result.length; resultCounter++) {
        nodes.push({value: result[resultCounter].value });
      }


      this.nodes = nodes;

      this.links = [];


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
