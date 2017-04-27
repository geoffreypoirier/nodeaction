import {Component} from '@angular/core';
import {NodeDataService} from './node-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  address: String = '107.100.76';
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
      address: this.address,
      depth: this.depth,
    };

    this.nodeData.getNodes(req).subscribe(result => {

      const nodes = [];
      const links = [];

      for (let resultCounter = 0; resultCounter < result.length; resultCounter++) {
        const node = result[resultCounter];


        nodes.push({value: node.value});

        // if a link, add it
        if (node.parent !== '') {
          links.push({source: node.value, target: node.parent});
        }

      }

      this.nodes = nodes;
      this.links = links;

    });
  }

  handleClick_randomize(): void {

    // grab an address from nodes and use as root
    this.address = this.nodes[Math.floor(Math.random() * this.nodes.length)].value;

  }

  handleClick_getData(): void {
    this.updateData();
  }

}
