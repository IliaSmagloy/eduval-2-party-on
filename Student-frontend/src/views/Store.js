/* eslint jsx-a11y/anchor-is-valid: 0 */
import history from '../history';
import React from "react";
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Badge,
  Button
} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import TimeoutAlert from "../components/common/TimeoutAlert";
import awsIot  from 'aws-iot-device-sdk';


class Store extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: res,
      course:{},
      balance:555,
      // Third list of posts.
      PostsListThree: [],
      lessons_status: {},

    };
    console.log("props for Store is ", this.props.match.params.id);
    var headers = {
        'X-Api-Key': 'ZrcWSl3ESR4T3cATxz7qN1NONPWx5SSea4s6bnR6'
    };
    //getting data on the course
    axios.get('https://api.emon-teach.com/course/'+this.props.match.params.id,
     {headers: headers})
      .then(response =>{console.log(response.data); this.setState({course: response.data});} );

//getting emon balance of student in the course
    axios.get('https://api.emon-teach.com/student/'+ localStorage.getItem('student_id')
    + '/emonBalance/byCourse/'+this.props.match.params.id,
     {headers: headers})
      .then(response =>{console.log(response.data); this.setState({balance: response.data ? response.data : 0});} );

//adding a fake item to the course
      // axios.post('https://api.emon-teach.com/shop/'+this.props.match.params.id+ '/items',
      // {id:0, name:"Cool Item", description:"cool",cost:1,amountAvailable:4,sellByDate: "2019-06-12"},
      //  {headers: headers})
      //   .then(response =>{console.log(response.data); } );

        axios.get('https://api.emon-teach.com/shop/'+this.props.match.params.id+ '/items',
         {headers: headers})
         .then(response =>{var data = Array.from(response.data); console.log(data);this.setState({PostsListThree: data.filter(elem => elem.amountAvailable>0) }); } );




      let res=[];






           const getContent = function(url) {
      return new Promise((resolve, reject) => {
    	    const lib = url.startsWith('https') ? require('https') : require('http');
    	    const request = lib.get(url, (response) => {
    	      if (response.statusCode < 200 || response.statusCode > 299) {
    	         reject(new Error('Failed to load page, status code: ' + response.statusCode));
    	       }

    	      const body = [];
    	      response.on('data', (chunk) => body.push(chunk));
    	      response.on('end', () => resolve(body.join('')));
    	    });
    	    request.on('error', (err) => reject(err))
        })
    };






  }
   sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

  stringToColour(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

  stringToInitials(str){
    return str.split(" ").map((n)=>n[0].toUpperCase()).join("");
  }

  getCorrectTextColor(hex){

    const threshold = 130;


    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

    hex = cutHex(hex);
    let hRed = hexToR(hex);
    let hGreen = hexToG(hex);
    let hBlue = hexToB(hex);

    let cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
      if (cBrightness > threshold){return "#000000";} else { return "#ffffff";}
  }

  postbuy(post){
    if(this.state.balance< post.cost){
      this.setState({message: "you dont have enough Emons to buy this item ", error: true ,success :false});
      return;
    }
    if(post.amountAvailable == 0){
      this.setState({message: "The item is sold out ", error: true,success :false});
      return;
    }

    var headers = {
        'X-Api-Key': 'ZrcWSl3ESR4T3cATxz7qN1NONPWx5SSea4s6bnR6'
    };
    axios.post('https://api.emon-teach.com/shop/'+this.props.match.params.id+ '/order',
    {studentId: localStorage.getItem('student_id') ,itemId: post.id , amount : 1},
     {headers: headers})
      .then(response =>{this.setState({message: "The items is successfully bought", success: true, error:false}); } );

      this.sleep(500);
      //getting emon balance of student in the course
    axios.get('https://api.emon-teach.com/student/'+ localStorage.getItem('student_id')
    + '/emonBalance/byCourse/'+this.props.match.params.id,
     {headers: headers})
      .then(response =>{console.log("balance now: "+ response.data); this.setState({balance: response.data ? response.data : 0});} );


    axios.get('https://api.emon-teach.com/shop/'+this.props.match.params.id+ '/items',
     {headers: headers})
      .then(response =>{this.setState({PostsListThree: response.data.filter(elem => elem.amountAvailable>0) }); } );




  }
   getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}





  render() {
    const {
      PostsListOne,
      PostsListTwo,
      PostsListThree,
      PostsListFour
    } = this.state;
    var rand;



    return (


      <Container fluid className="main-content-container px-4">
                {this.state.error &&
          <Container fluid className="px-0" >
          <TimeoutAlert className="mb-0" theme="danger" msg={this.state.message} time={3000} />
          </Container>
          }

               {this.state.success &&
          <Container fluid className="px-0">
          <TimeoutAlert className="mb-0" theme="success" msg={this.state.message} time={3000} />
          </Container>
          }
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={this.state.course.name+"'s Store"} subtitle="You can buy stuff with your Emons"
                     className="text-sm-left" />


        </Row>
        <Row >
              <Col >
                <div style={{fontSize: 20}}><p>You have {this.state.balance} Emons in this course</p></div>
              </Col>
        </Row>




        {/* First Row of Posts */}
        <Row>
          {
            Array.from(this.state.PostsListThree).map((post, idx) => (
            <Col lg="4" key={idx}>
              <Card small className="card-post mb-4">
                <CardBody>



                  <h4 className="card-title" style={{ color:  this.getRandomColor() }}>{post.name}</h4>
                  <p className="card-text text-muted" style={{ color:  this.getRandomColor() }}><b>Description: </b>{" "+ post.description}</p>
                  <p className="card-text text-muted" style={{ color:  this.getRandomColor() }}><b>Cost: </b>{" "+post.cost}</p>
                  <p className="card-text text-muted" style={{ color:  this.getRandomColor() }}><b>Amount Left: </b>{" "+post.amountAvailable}</p>

                </CardBody>
                <CardFooter className="border-top d-flex">
                  <div className="card-post__author d-flex">
                    <div className="d-flex flex-column justify-content-center ml-3">
                    <a ><Button ssize="sm"   theme="white" onClick={() => {console.log("Pushed on item "+ post.id);this.postbuy(post)}}>
                      <i className="far  mr-1" /> Buy
                    </Button></a>
                    </div>
                  </div>
                  </CardFooter>


              </Card>
            </Col>
          ))}
        </Row>

      </Container>


    );

  }

}

export default Store;
