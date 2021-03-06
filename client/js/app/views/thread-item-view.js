define([    "jquery",
            "underscore",
            "backbone",
            "dot",
            "text!templates/thread-item-view.html"],
function (  $,
            _,
            Backbone,
            doT,
            threadItemViewTemplate) {

    "use strict";

    return Backbone.View.extend({
        template: doT.template(threadItemViewTemplate),
        initialize: function() {
            this.listenTo(this.model, "change", this.render);
        },
        events: {
            "submit #sms-form": "sendSms",
            "click #refresh-thread": "refreshThread"
        },
        render: function() {
            this.$el.html(this.template(this.model.attributes));
    
            return this;
        },
        sendSms: function(evt) {
            var that = this,
                smsText = this.$el.find("#sms-textarea").val(),
                smsPhone;

            evt.preventDefault();

            // if contact already exists, just pull their associated phone number
            if (this.model.get("contact").phone.length > 0) {
                smsPhone = this.model.get("contact").phone;
            }
            // otherwise, we have to iterate over the entire message thread until we
            //  find a message from them and pull the number out of the 'from:' field
            else {
                $.each(this.model.get("messages"), function(index, value) {
                    if (value.from.indexOf("Me:") === -1) {
                        smsPhone = value.from;

                        // boot us out of the loop early since we already now have their
                        //  phone number
                        return false;
                    }
                });
            }

            smsPhone = smsPhone.replace(/[^0-9]/g, "");

            return $.ajax({
                url: "http://localhost:3000/sms",
                type: "POST",
                data: {
                    phoneNumber: smsPhone,
                    text: smsText,
                    _rnr_se: GVMA.user.rnrse,
                    token: GVMA.user.token
                },
                beforeSend: function() {
                    
                }
            }).done(function(data) {
                var jsonResponse = {},
                    smsCompleteMessage = "";

                // service sends back JSON string on successful attempt, or entire HTML
                //  document on failed attempt; need to handle errors so we don't try to
                //  parse HTML as JSON
                try {
                    jsonResponse = JSON.parse(data);
                }
                catch(error) {
                    smsCompleteMessage = "an error occurred while sending your text";
                }

                if (jsonResponse.hasOwnProperty("ok")) {
                    if (jsonResponse.ok) {
                        smsCompleteMessage = "text successfully sent";
                    }
                    else {
                        smsCompleteMessage = "text could not be sent";
                    }
                }

                console.log(smsCompleteMessage);                
            });
        },
        refreshThread: function(evt) {
            var that = this;

            evt.preventDefault();

            return $.ajax({
                url: "http://localhost:3000/inbox",
                type: "GET",
                dataType: "json",
                data: {
                    page: 1,
                    token: GVMA.user.token
                },
                beforeSend: function () {
                    that.$el.find("#loading-thread").css("display", "block");
                }
            }).done(function(data, textStatus, jqXHR) {
                for (var i = 0; i < data.messages.length; i++) {
                    if (data.messages[i].id === that.model.get("id")) {
                        that.model.set("messages", data.messages[i].messages);
                    }
                }
            }).fail(function(collection, xhr, options) {
                
            }).always(function() {
                that.$el.find("#loading-thread").css("display", "none");
            });
        }
    });

});