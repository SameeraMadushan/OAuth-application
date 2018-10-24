import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit {

  constructor(private http: Http) { }

  albums: any;
  api_url = "http://localhost:3000";

  ngOnInit() {

    this.loadAlbums().subscribe(data => {
      this.albums = data.albums;
      console.log(data)
    })

  }

  private setHeaders(): Headers {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    return new Headers(headersConfig);
  }

  //Perform a GET Request
  get(path: string, params: URLSearchParams = new URLSearchParams()): Observable<any> {
    return this.http.get(`${this.api_url}${path}`, { headers: this.setHeaders(), search: params })
      .map((res: Response) => res.json());
  }

  //get all the users from the system
  loadAlbums() {
    return this.get('/getAlbums')
      .map(
        data => {
          return data;
        }
      );
  }
}
