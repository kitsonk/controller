.. _dojo-controller/docs/command/Command:

===============================
dojo-controller/command/Command
===============================

.. contents ::
    :depth: 2

Introduction
============

Usage
=====

Examples
========

Here is a basic example that pushes an element on an array via the ``execute()`` and pops one off via the ``undo()`` methods.

.. js::

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

Here is an example where functionality is extended by using the dojo/Evented functionality:

.. js::

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
    
    myCommand.on("execute", function(args){
      console.log("myCommand executed with value: " + args.value);
    });
    myCommand.on("undo", function(){
      console.log("myCommand undid");
    });
    
    myCommand.execute({ value: 1 });
    myCommand.undo();
  });

See also
========
