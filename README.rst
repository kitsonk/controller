.. _dojo-controller/README:

========================
dojo-controller Overview
========================

.. contents ::
    :depth: 2

**dojo-controller** is a Dojo based package that implements the concepts of Commands and Actions in order to allow
developers to easily abstract and centralise their control code in an application.

This code is based on modules from `Maqetta <http://maqetta.org/>`_.

dojo-controller/command
=======================

This sub-package provides the modules that abstract the concept of "commands".

dojo-controller/command/Command
-------------------------------

An object that allows abstraction and management of "command" type logic. Full documentation can be found here:
`dojo-controller/command/Command <docs/command/Command>`_.

Example
~~~~~~~

Here is an example::

    require(["dojo-controller/command/Command"], function(Command){
      var output = [];
      var myCommand = new Command({
        execute: function(arg1){
          output.push(arg1);
        },
        undo: function(){
          output.pop();
        }
      });
    
      myCommand.execute("something");
      console.log(output);
      myCommand.undo();
      console.log(output);
    });

dojo-controller/command/CommandStack
------------------------------------

An object that handles execution of commands and puts them into a queue which then can be undone and redone as required.

Example
~~~~~~~

Here is an example::

    require(["dojo-controller/command/CommandStack", "dojo-controller/command/Command"], 
    function(CommandStack, Command){
      var output = [];
      var command1 = new Command({
        execute: function(){
          output.push("command1 execute");
        },
        undo: function(){
          output.push("command1 undo");
        }
      });
      var command2 = new Command({
        execute: function(){
          output.push("command2 execute");
        },
        undo: function(){
          output.push("command2 undo");
        }
      });
      var commandstack = new CommandStack();
      commandstack.execute(command1);
      commandstack.execute(command2);
      commandstack.undo();
      commandstack.undo();
      
      // output = ["command1 execute", "command2 execute", "command2 undo", "command1 undo"]
      console.log(output);
    });


dojo-controller/command/CompoundCommand
---------------------------------------

A command that has several sub-commands that need can be executed and undone.

Example
~~~~~~~

Here is an example::

    require(["dojo-controller/command/CompoundCommand", "dojo-controller/command/Command"],
    function(CommandStack, Command){
      var output = [];
      var command1 = new Command({
        execute: function(){
          output.push("command1 execute");
        },
        undo: function(){
          output.push("command1 undo");
        }
      });
      var command2 = new Command({
        execute: function(){
          output.push("command2 execute");
        },
        undo: function(){
          output.push("command2 undo");
        }
      });
      var compoundcommand = new CompoundCommand();
      
      compoundcommand.add([command1, command2]);
      compoundcommand.execute();
      
      // output = ["command1 execute", "command2 execute"]
      console.log(output);
    })

dojo-controller/action
======================

dojo-controller/action/Action
-----------------------------

This class bridges the gap between behaviour and visual UI elements.  It binds with Dijit/widgets and controls their configuration.  It also provides functionality to manage Commands and a CommandStack to provide further centralised management of behaviour code.

Examples
~~~~~~~~

Here is an example::

  require(["dojo-controller/action/Action", "dojo-controller/command/Command", "dojo-controller/command/Command-Stack",
    "dijit/form/Button"],
  function(Action, Command, CommandStack, Button){
    var command = new Command({
      execute: function(){
        console.log("command execute");
      },
      undo: function(){
        console.log("command undo");
      }
    });
    var commandStack = new CommandStack();
    var action = new Action({
      label: "Click Me",
      title: "Does something when clicked",
      iconClass: "dijitEditorIcon dijitEditorIconSave",
      command: command,
      commandStack: commandStack
    });
    
    var button = new Button({
      id: "button"
    }, "someNode");
    
    action.bind(button);
  });


dojo-controller/Attributed
==========================

An class that combines ``dojo/Evented`` and ``dojo/Stateful`` and then adds in the concept of attributes that have
auto-magically recognised getters and setters. This is similar to the attribute getter and setter functionality in
``dijit/_WidgetBase``.
