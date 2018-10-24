import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Rx';
import { parse } from 'querystring';
import {ChartsModule, Color} from 'ng2-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  socket: any;
  image: any;
  power: any;
  obsvr: any;
  temperature: any;

  public chartType: string = 'doughnut';

  public chartData: Array<any> = [0, 20];

  public chartLabels: Array<any> = ['Temperature'];

  public chartColors: Array<any> = [{
    hoverBorderColor: ['rgba(0, 0, 0, 0.1)', "rgba(0, 0, 0)"],
    hoverBorderWidth: 0,
    backgroundColor: ["#F7464A", "#FFFFFF"],
    hoverBackgroundColor: ["#FF5A5E", "#FFFFFF"]
  }];

  labels:string[] = ['Temperature','asss'];
  data:number[] = [0,20];
  type:string = 'doughnut';
  
  colorsUndefined: Array<Color>;

  public chartOptions: any = {
    responsive: true
  };

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  public ngOnInit(): void {
    this.power = "off";
    this.changeLedStatus();
    this.temperature = "0";
    this.chartData[0]= parseInt(this.temperature);
    this.obsvr = this.getLatestUpdate().subscribe(message => {
      // this.power = message;
      this.temperature = message;
      this.changeLedStatus();
      this.chartData[0]= parseInt(message);
      console.log(parseInt(message))
    })
  }

  onclick(command: any) {
    if (command == "ON") {
      this.socket.emit("setLedStatus", "on");
    }
  }

  getLatestUpdate(): any {
    let observable = new Observable(observer => {
      this.socket.on('getLedStatus', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  changeLedStatus() {
    if (this.power == "on") {
      this.image = "../assets/On.png";
    }
    else if (this.power == "off") {
      this.image = "../assets/Off.png";
    }
  }




  public chartClicked(e: any): void { 
        
  } 

  public chartHovered(e: any): void { 
      
  }

}
