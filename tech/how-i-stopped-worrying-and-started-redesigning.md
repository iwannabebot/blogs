---
title: How I stopped worrying and started redesigning?
description: Solution architects in this micro-services era are advocating an aversion to monolithic architectures. Here is the story with one such monolith.
image: ../images/nilay.png
published: 06/02/2019
---

## ⚡ How I stopped worrying and started redesigning?

![banner](../images/banner.jpeg)

Solution architects in this micro-services era are advocating an aversion to monolithic architectures. Which is totally justified! A monolith even if it is modularised to a very reasonable degree, resist the change needed to keep itself healthy. Even if you have some compelling arguments to choose such an architecture, be assured that with posterity accumulated [gotchas](https://www.urbandictionary.com/define.php?term=gotcha) will eventually outweigh your arguments.


*Here is the story with one such monolith.*

To be fair, this application was not as badly written as it has performed. It was properly modularised with a good amount of focus given on decoupling objects by their role and concerns. In a simpler world, it could have stayed relevant for a really long time. But sadly, after a few months of it being live in production, it has to be and is being redesigned.

The core of this application was a self-hosted Windows process with separate class libraries dedicated to different business logic and operations. Each of these operations would start on some specific time. A background thread was responsible for this scheduling. A Job factory ran each job in their own thread. Everything seemed perfect on paper. A Proof of Concept was created which showed how every part was feasible and worked.

![banner](https://cdn-images-1.medium.com/max/1600/0*jzTfbstmjQZ8UFSn.png)

Everything went well within a few days of its lifecycle. No abnormal CPU frequencies and hard faults were observed.

For most of the operations, there was no single source of truth (data was integrated from multiple sources including a Dynamics CRM backend), and all the operation results were stored in a fast local cache. As these operations were supposed to be transactional, a global semaphore blocked transactional operations in separate threads. This was a bad idea. We understood earlier that with a small number of jobs, there was no problem in blocking threads, but with a growing number of jobs, it was imperative that we either add some concurrency control method. We chose to use a Monitor object to allow only one thread in the critical section. This resolved any problem we faced in this architecture. But only for a few days.

We were using a custom implementation of .NET ThreadPool built by one of our senior developers. This thread pool allowed us to control the ordering and grouping of dependent jobs, which was very important for Job Scheduling. This was stable and relied upon abstraction. However, a few days later, we observed some unexpected problems. The threads in Job scheduler started starving and long-running jobs would timeout without doing any work. After diagnosing this issue for weeks, it turns out that some of the jobs were creating service objects which should be but never disposed of. This resulted in a very high number of hard faults. To make matter worse, each of these service objects had an exception resilience policy. For a job to perform an _ACID_ transaction (with stateless operations like HTTP requests), each request should be able to handle and retry transient exceptions (to support requests with return code like bad-gateway, service-unavailable, gateway-timeout, not-found, request-timeout). These exceptions with a growing number of non-transient exceptions, over time interrupted threads at high frequencies. Thus with the different operation implementations, it was possible to break an underlying framework. Sure, we could have ignored this by limiting what tasks an operation can perform. But this would have been a big anti-pattern, which we didn't want to introduce. After a long tiring week of debugging, some more concurrency issues were found. It became difficult for us to pinpoint what all changes were required to fix this system.

It was at this time when we realized that more fixes are not going to solve anything. The problem with this kind of application was that there were too many touch points, any of which could have result in repeated failures.

> If you ever get to the point where exceptions are significantly hurting your performance, you have problems in terms of your use of exceptions beyond just the performance
>
> ~ Jon Skeet

---

### A new perspective

There was much semantics for us to decide if we need to move to a better, more scalable architecture.

Last winters I was first introduced with Azure Functions. Functions bring significant potential to your application with its various invocation strategies. But for a workflow-driven application, it's advantages are unparalleled.

_If you are not familiar with Azure Functions I would suggest you read [this article](https://medium.com/grapecity/an-introduction-to-azure-functions-845fbf0033af)._

> ⚡ Functions ⚡

> Functions let you run your code as a 'function' in some computer and this 'function' could start in various fashions like:
> - adding an item in Blob Storage, Queue storage or Cosmos DB,
> - message queueing via Event Grid, Event Hubs, Microsoft Graph Events, Service Bus and 
> - via HTTP/Webhooks and Timers
> You can pass the result of your function into most of the azure pipelines. 

### Here are some of the biggest takeaways from Functions:

 - Functions can be invoked from any external event source. No integration is required.
 - Functions are load balanced.
 - With proper IoC implementation, any operation in Functions can execute parallelly with windows service.
 - Since functions are essentially stateless, a storage queue can be used to maintain 'state' over a long-running task (ex: Durable Function).
 - Functions which throws an unhandled error, update dequeue counter of the triggering queue item. Thus, for transient errors, poison queue items can be processed separately.
