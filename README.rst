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
        execute: function(args){
          output.push(args.value);
          this.inherited(arguments);
        },
        undo: function(){
          output.pop();
          this.inherited(arguments);
        }
      });
    
      myCommand.execute({ value: 0 });
      console.log(output);
      myCommand.undo();
      console.log(output);
    });

dojo-controller/command/CommandStack
------------------------------------

An object that handles execution of commands and puts them into a queue which then can be undone and redone as required.

dojo-controller/command/CompoundCommand
---------------------------------------

A command that has several sub-commands that need can be executed and undone.

dojo-controller/action
======================

TODO - description

dojo-controller/action/Action
-----------------------------

dojo-controller/action/_ActionWidgetMixin
-----------------------------------------

dojo-controller/Attributed
==========================

An class that combines ``dojo/Evented`` and ``dojo/Stateful`` and then adds in the concept of attributes that have
auto-magically recognised getters and setters. This is similar to the attribute getter and setter functionality in
``dijit/_WidgetBase``.