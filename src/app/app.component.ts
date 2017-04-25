import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  depth;

  // chart vars
  view: any;
  colorScheme = {
    domain: ['#666666', '#777777', '#888888', '#999999', '#aaaaaa', '#bbbbbb']
  };
  showLegend = false;
  legendTitle = 'dummy data';

  nodes: any = [
    {
      "value": "111.222.111"
    },
    {
      "value": "122.211.122"
    },
    {
      "value": "133.133.133"
    }
  ];

  links: any = [{
    source: '111.222.111', target: '122.211.122'
  }];

  constructor() {
  }


  handleClick_getData(): void {
    console.log('clicked');

  }

}
