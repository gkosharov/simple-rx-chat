/**
 * Created by georgikosharov on 15/02/17.
 */
import React, {Component} from 'react'
import {List, ListItem} from 'material-ui/List'


export default class ChatPane extends Component {
    buildItems() {
        if (this.props.messages) {
            return this.props.messages.map((m)=> {
                return (<ListItem primaryText={m.id} secondaryText={m.status}/>);
            });
        }
        return [];
    }

    render() {
        return (
            <div>
                <h1>{"Messages"}</h1>
                <List>
                    {this.buildItems()}
                </List>
            </div>
        )
    }
}