/**
 * Created by georgikosharov on 15/02/17.
 */
import React, {Component} from 'react'
import {Row, Col} from 'react-bootstrap'
import Rx from 'rxjs'

export default class NewMessagePane extends Component {
    componentDidMount() {
        var socket = this.props.socket;
        if (socket) console.log("Socket passed to the chat pane!");
        var button = document.getElementById('sendBtn');
        var textField = document.getElementById('message-input');

        var clickStream = Rx.Observable.fromEvent(button, 'click').map(e => true);
        var enterKeyPressedStream = Rx.Observable.fromEvent(textField, 'keyup').filter(e => e.keyCode == 13);
        var textEnteredStream = Rx.Observable.fromEvent(textField, 'keyup').map(e => e.target.value);
        var sendMessageStream = Rx.Observable.merge(clickStream, enterKeyPressedStream);

        var mergedStream = textEnteredStream.takeUntil(sendMessageStream);

        var socketUpstream = mergedStream.map((e)=> {
            let m = {text: e, sender: 'me', timestapmp: Date.now()}
            console.log("To upstream: ", JSON.stringify(m));
            socket.send(JSON.stringify(m));
        });
        socketUpstream.subscribe(
            ()=> {
                textField.value = '';
                textField.focus();
                console.log("Socket upstream subscriber onNext")
            },
            (e)=> {
                console.log("Socket upstream subscriber onComplete: ", e)
            },
            (e)=> {
                console.log("Socket upstream subscriber onError: ", e)
            });
        var text = '';
        var onNext = t => {
            text = t;
        }
        var onError = e => {
        }
        var onComplete = () => {
            textField.value = '';
            textField.focus();
            mergedStream.subscribe(onNext, onError, onComplete);
        }

        mergedStream.subscribe(onNext, onError, onComplete);
    }

    render() {
        return (
            <Row>
                <Col md={9}>
                    <input id="message-input" type="text" className="validate" ref="message"/>
                    <label className="active" htmlFor="message-input">Type your chat, enter/return or hit button to send</label>
                </Col>
                <Col md={3}>
                    <a id="sendBtn" className="btn-floating btn-large waves-effect waves-light red">
                        <i className="material-icons">send</i>
                    </a>
                </Col>
            </Row>
        )
    }
}