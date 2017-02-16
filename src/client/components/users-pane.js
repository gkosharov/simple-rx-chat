/**
 * Created by georgikosharov on 15/02/17.
 */
import React, {Component} from 'react'
import {List, ListItem} from 'material-ui/List'


export default class UsersPane extends Component {
    buildItems() {
        var user = this.props.user;
        if (this.props.users) {
            return this.props.users.map((u)=> {
                return (<ListItem primaryText={u.id} secondaryText={u.status}/>);
            });
        }
        return [];
    }

    render() {
        return (
            <div>
                <h1>{"Users"}</h1>
                <List>
                    {this.buildItems()}
                </List>
            </div>
        )
    }
}