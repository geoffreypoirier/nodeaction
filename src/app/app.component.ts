import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  coreAddress: String = '100.100.100';
  depth: Number = 5;
  limit: Number = 25;

  // chart vars
  view: any;
  colorScheme = {
    domain: ['#222222', '#333333', '#444444', '#555555', '#666666', '#777777']
  };
  showLegend = false;
  legendTitle = 'dummy data';

  nodes: any = [
    {'value': '111.222.111'},
    {'value': '122.211.122'},
    {'value': '133.133.133'}
  ];

  links: any = [{
    source: '111.222.111', target: '122.211.122'
  }];

  constructor() {
  }

  handleClick_randomize(): void {

    // create a random address
    this.coreAddress = Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);

  }

  handleClick_getData(): void {
    console.log('clicked');
  }

}
