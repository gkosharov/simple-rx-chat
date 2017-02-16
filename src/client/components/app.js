import React, {Component} from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Grid, Row, Col} from 'react-bootstrap'
import AppBar from 'material-ui/AppBar'
import ChatPane from './chat-pane'
import UsersPane from './users-pane'
import NewMessagePane from './new-message-pane'
import io from 'engine.io-client'
import Rx from 'rxjs'


export default class App extends Component {

    constructor() {
        super()

        this.state = {
            users: [],
            messages: [],
            socket: io('ws://localhost:4000')
        }
    }

    componentDidMount() {

        var socket = this.state.socket || io('ws://localhost:4000');
        var props = this.props;
        var users = this.state.users || [];
        var messages = this.state.messages || [];
        var self = this;

        //Happens first, same time with io.on('connection') on server, but useless
        //because it has not socketId.  We do nothing with this event
        //socket.on('connect', () => {});

        var socketIdStream = Rx.Observable.create(observer => {
            socket.on('connect', data => {
                console.log("On my socket id: ", arguments);
                observer.next(data);
            });
        });

        socketIdStream.subscribe(socket => {
            socket.send(JSON.stringify({
                nickname: props.nickname,
                socketId: socket,
                connectTime: socket.connectTime
            }));
        });

        var usersStream = Rx.Observable.create(observer => {
            socket.on('all users', data => {
                console.log("on all users: ".data);
                observer.next(data);
            });
        });

        usersStream.subscribe(data => {
            self.setState({users: data});
        });

        var messagesStream = Rx.Observable.create(observer => {
            socket.on('message', data => {
                var parsed = JSON.parse(data);
                observer.next(parsed);
            });
        });

        messagesStream.subscribe(data => {
            console.log("data on message received: ", data);
            let parsed = typeof data === 'string' ? JSON.parse(data) : data,
                content = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data
            if(parsed.type === "connect"){
                self.setState({users: content })
            }else if(parsed.type === "message"){
                let messages = this.state.messages.map(i=>i)
                messages.push(content)
                self.setState({messages: messages});

            }

            console.log(parsed);

        });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    <AppBar
                        title={`Rx-Chat`}
                    />
                    <Grid>
                        <Row>
                            <Col md={6}>
                                <UsersPane users={this.state.users || []}/>
                            </Col>
                            <Col md={6}>
                                <ChatPane
                                    messages={this.state.messages || []}
                                    socket={this.state.socket}
                                />
                            </Col>
                        </Row>

                        <NewMessagePane socket={this.state.socket}/>

                    </Grid>
                </div>
            </MuiThemeProvider>
        );
    }
}