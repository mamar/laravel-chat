import React from 'react';
import './styles.css';
import { EmojiButton } from '@joeattardi/emoji-button';

class Chatpanel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            msg_list:[],
            user_list:[],
            active_user:[],
            current_usr:0,
            messageList: [],
            chosenEmoji: {},
            clicked: false,
            childVisible: false,
            text: ""
        }        
        // alert(user.id);
        this.handleEve = this.handleEve.bind(this);
        this.subscribeToPusher = this.subscribeToPusher.bind(this);
        this.loadUsers = this.loadUsers.bind(this);
        this.loadChats = this.loadChats.bind(this);
        this.onEmojiClick = this.onEmojiClick.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.window = this.window.bind(this);
        
    }

    handleClick(e) {
        this.setState({childVisible: !this.state.childVisible});
    }

    onEmojiClick(event, emojiObject) {
        console.log('the event is ',event)
        console.log("eo", emojiObject);
        this.setState({ chosenEmoji: emojiObject }, () => {
          console.log(this.state.chosenEmoji, "chosenEmoji()");
        });
    }

    componentDidMount(){
        this.loadUsers();
        //this.subscribeToPusher();    
    }

    loadUsers(){
        let tok = document.querySelector('meta[name="csrf-token"]').content;
        fetch('http://localhost:8000/api/fetchusers',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                X_CSRF_TOKEN:tok,
                'Accept':'application/json'
            }
        })
        .then(response => response.json())
        .then(dat => {
            let arr = [];
            for(var x=0;x<dat.length;x++){
                arr.push(dat[x]);
            }
            this.setState({user_list:this.state.user_list.concat(arr)});

            console.log('this beauty ', arr.find(obj => { return obj.id}));
        })
        .catch((error) => {
            console.error(error);
        }); 
    }

    loadChats(el_id){
        let clicked_user_id = Number(el_id.target.id);
        console.log('asdfg',clicked_user_id);
        
        this.setState({ current_usr: clicked_user_id }, () => {
            console.log(this.state.current_usr, 'current user');
        }); 
        
        for(var eu=0;eu<this.state.user_list.length;eu++){
            if(this.state.user_list[eu].id == clicked_user_id){
                this.setState({active_user:this.state.active_user.splice(0,this.state.active_user.length)});
                this.setState({active_user:this.state.active_user.concat(this.state.user_list[eu])});
                break;
            }
        }
        let tok = document.querySelector('meta[name="csrf-token"]').content;

        fetch('http://localhost:8000/api/fetchmessages?receiver_id='+clicked_user_id,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                X_CSRF_TOKEN:tok,
                'Accept':'application/json'
            }
        })
        .then(response => response.json())
        .then(dat => {
            this.setState({
            });
            console.log(JSON.stringify(dat));
            let arr = [];
            for(var x=0;x<dat.length;x++){
                //console.log(JSON.stringify(dat[x].message));
                arr.push(dat[x]);      
            }
            this.setState({msg_list:[]});
            this.setState({
                msg_list:this.state.msg_list.concat(arr)
            });
            console.log('messsages', this.state.msg_list)
        })
        .catch((error) => {
            console.error(error);
        }); 
    }
    
    handleEve(e){
        console.log('wiwi', e.target.value)
        console.log('wiwii',this.state.text)
        
        let msg = this.state.text;
        console.log('message ', msg)
        
        let tok = document.querySelector('meta[name="csrf-token"]').content;
        let user_id = this.state.current_usr;
        console.log('comeon', user_id)
        // console.log(this.current_usr, el_id, e);
        let data = new FormData();
        data.append('message','msg');
        fetch('messages?message='+msg+'&rec_id='+user_id,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'X-CSRF-TOKEN':tok,
                'Accept':'application/json'
            },
            //body:JSON.stringify(data)
        })
        .then(response => response.json())
        .then(dat => {
            console.log('from handleve : '+JSON.stringify(dat));
        })
        .catch((error) => {
            console.error(error);
        });

        //this.subscribeToPusher();       

        
    }

    subscribeToPusher(){
        let a_tok = document.querySelector('meta[name="csrf-token"]').content;
        //suscribing to pusher channel
        Pusher.logToConsole = true;
        var pusher = new Pusher('86fa8a8b897d23aae21b', {
            cluster: 'eu',
            authEndpoint:'/broadcasting/auth',
            auth:{
                headers:{
                    'X-CSRF-TOKEN':a_tok
                }
            }
        });
        var new_msg = [];
        var channel = pusher.subscribe('private-spark1-'+user.id);
        channel.bind('message.chats', function(d) {
            console.log("you have a new message:"+JSON.stringify(d));
            alert(d.msg);
            //new_msg.push(d.message.message);
            //console.log(JSON.stringify(new_msg));            
        });        
    }

    handleChange = (e) => {
       this.setState({ text: e.target.value });
        console.log('in handle ', this.state.text)
        console.log(e)
    }

    window(e){
        console.log('lissst',this.state.text)
        const button = document.querySelector('#emoji-button');
        const picker = new EmojiButton();

        picker.on('emoji', emoji => {
          document.querySelector('input').value += emoji.emoji;
        //   e.target.value += emoji.emoji;
          this.state.text += emoji.emoji;
          console.log(emoji.emoji,'emoji')
          console.log('text', this.state.text)
        });
        console.log('wiiwii', e.target.value)
        console.log('praise ', this.state.text)
      
        button.addEventListener('click', () => {
          picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button);
        });
    };

    render(){
        let isAnyUserActive=false;
        if(this.state.active_user.length != 0){
            isAnyUserActive=true;
        }
        return (
            <div className="container">                
                <div className="row no-gutters">
                    <div className="col-3">
                        <div className="card">
                            <div className="card-header">card header</div>
                            <div className="card-body">
                                <ul id="user_list" className="user_list list-group">
                                    {this.state.user_list.map((number) =>
                                    <a href="#"><li id={number.id} onClick={this.loadChats} className="list-group-item list-group-item-action" key={number.id}>{number.name}</li></a>  )}
                                </ul>
                            </div>                            
                        </div>
                    </div>
                    <div className="col">
                        <div className="card">
                            <div className="card-header">{isAnyUserActive?this.state.active_user[0].name:'no active'}</div>
                            <div className="card-body">
                                <ul id="chat_list" className="chat_list list-group">
                                    {this.state.msg_list.map((msgs) =>
                                    <li className="list-group-item" id={msgs.id} key={msgs.id}>{msgs.message}</li>  )}
                                </ul>
                            </div>
                            <div className="card-footer">
                            
                                
                                {this.state.text}
                                
                                <input type="text" value={this.state.text} onChange={this.handleChange} />
                                <button id="emoji-button" onClick={this.window}>?</button>
                                <input type="submit" className="btn btn-primary btn-sm" value="Send" onClick={this.handleEve} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Chatpanel;