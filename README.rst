.. _dojo-contoller/README:

========================
dojo-controller Overview
========================

.. contents ::
    :depth: 2

**dojo-controller** is a Dojo based package that impliments the concepts of Commands and Actions in order to allow developers to easily abstract and centralise their control code in an application.

This code is based on modules from `maqetta <http://maqetta.org/>`_.

dojo-controller/command
=======================

This sub-package provides the modules that abstract the concept of "commands".

dojo-controller/command/Command
-------------------------------

An object that allows abstraction and management of "command" type logic.

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

