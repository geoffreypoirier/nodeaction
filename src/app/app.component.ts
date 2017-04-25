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


  handleClick_getData(): void {
    console.log('clicked');

  }

}
