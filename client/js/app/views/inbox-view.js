define([    "jquery",
            "underscore",
            "backbone",
            "dot",
            "text!templates/inbox-view.html",
            "views/inbox-item-view"],
function (  $,
            _,
            Backbone,
            doT,
            inboxViewTemplate,
            InboxItemView) {

    "use strict";

    return Backbone.View.extend({
        template: doT.template(inboxViewTemplate),
        initialize: function() {
            this.listenTo(this.collection, "reset", this.renderCollection);
        },
        events: {
            "click #refresh-inbox": "refreshInbox"
        },
        render: function() {
            this.$el.html(this.template(this.collection.options));
    
            return this;
        },
        renderCollection: function() {
            var that = this;
 
            this.collection.each(function(inboxItem) {
                var inboxItemView = new InboxItemView({
                    model: inboxItem
                });

                $(that.el).append(inboxItemView.render().el);
            });
        },
        fetchInbox: function(page) {
            var that = this;

            return this.collection.fetch({
                type: "GET",
                dataType: "json",
                data: {
                    page: page,
                    token: GVMA.user.token
                },
                beforeSend: function () {
                    console.log("begin retrieving inbox");
                }
            }).done(function(collection, response, options) {
                // console.log(collection);
                // console.log(response);
                // console.log(options);
            }).fail(function(collection, xhr, options) {
                // console.log(collection);
                // console.log(xhr);
                // console.log(options);
            }).always(function() {
                //console.log("always");;
            });
        },
        refreshInbox: function(evt) {
            evt.preventDefault();

            this.fetchInbox(this.collection.options.currentPage);
        }
    });

});