var React = require("react");
var Reflux = require("reflux");
var localforage = require("localforage");
var _ = require("lodash");

var Actions = Reflux.createActions([
    "addComment",
    "clearAll",
    "deleteComment"
]);


var model = Reflux.createStore({
    listenables: [Actions],
    comments: [],

    getInitialState() {
        return this.comments;
    },

    init() {
        localforage.getItem('comments').then((value)=> {
            var comments = value ? value : [];

            this.update(comments);
        })

    },

    update(comments) {
        return localforage.setItem('comments', comments)
            .then((value)=> {
                this.comments = value;
                this.trigger(this.comments);
            });
    },

    onAddComment(comment) {
        var commentObj = {
            text: comment,
            id: new Date().getTime()
        };

        var clone = _.clone(this.comments);

        clone.push(commentObj);
        this.update(clone);
    },

    onClearAll() {
        this.update([]);
    },

    onDeleteComment(id) {
        var newArray = _.remove(this.comments, (comment)=> comment.id != id);
        this.update(newArray);
    }
})


var Box = React.createClass({
    mixins: [
        Reflux.connect(model, "comments")
    ],

    handleClick(event) {
        var value = this.refs.comment.getDOMNode().value;
        if (value == "") return;
        Actions.addComment(value);
    },

    render() {
        return (
            <div>
                <button onClick={Actions.clearAll}>Clear All</button>
                <input ref="comment"/>
                <button onClick={this.handleClick}>Add Comment</button>

            {this.state.comments.map(function (comment) {
                return (
                    <div key={comment.id} onClick={Actions.deleteComment.bind(null, comment.id)}>{comment.text}</div>
                )
            }, this)}

            </div>
        )
    }
});


React.render(<Box/>, document.body);