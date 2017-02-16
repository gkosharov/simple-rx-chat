# simple-rx-chat
Simple reactive chat

Simple chat application based on engine.io and rxjs. The client app uses react for view and rxjs primitives for managing the application state

## Server

Model "connections" and "messages" as separate streams. The connections would wrap the socket.on('connection') and the messages would socket.on('messsage').

The connections are stored in an Immutable.Map which also represents the list of users. Each user contains a list of his messages.

Whenever a user connects, a message with the list of all users is being broadcasted to the other users. Also whenerver a user sends chat message, it is being relayed to the other users from the user list.

- engine.io is used to manage communication

- 
## Client

SPA based on react. It uses rxjs Observables to manage the application state. The state itself is stored in the state of the only "smart" components called "App". Then the users are passed down to the UsrsPane and the messages to the ChatPane.

- engine.io-client is used to manage the communication.

- material-ui is used to provide some basic ui components.

I planned to use rx-connect to provide binding rxjs primitives to react components in redux-like style. This would take the state management concerns away from the components. 

