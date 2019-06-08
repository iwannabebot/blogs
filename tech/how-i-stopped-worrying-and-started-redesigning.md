---
title: How I stopped worrying and started redesigning?
description: Solution architects in this micro-services era are advocating an aversion to monolithic architectures. Here is the story with one such monolith.
image: ../images/banner/how-i-stopped-worrying-and-started-redesigning.jpeg
published: 06/02/2019
---

## ⚡ How I stopped worrying and started redesigning?

![banner](../images/banner/how-i-stopped-worrying-and-started-redesigning.jpeg)

Solution architects in this micro-services era are advocating an aversion to monolithic architectures. Which is totally justified! A monolith even if it is modularised to a very reasonable degree, resist the change needed to keep itself healthy. Even if you have some compelling arguments to choose such an architecture, be assured that with posterity accumulated [gotchas](https://www.urbandictionary.com/define.php?term=gotcha) will eventually outweigh your arguments.

*Here is the story with one such monolith.*

![code_quality](https://imgs.xkcd.com/comics/code_quality_2.png)

To be fair, this application was properly modularised, with a good amount of focus given on decoupling objects by their role and concerns. It was not written as bad as it has performed. In a simpler world, it could have stayed relevant for a really long time. But sadly, after a few months of it being live in production, it had to be (and is being) redesigned.

The core of this application was a self-hosted Windows process with separate class libraries dedicated to different business logic and operations. Each of these operations would start on some specific time. A background thread was responsible for this scheduling. A Job factory ran each job in their own thread. Everything seemed perfect on paper. A Proof of Concept was created which showed how every part was feasible and worked.

![banner](https://cdn-images-1.medium.com/max/1600/0*jzTfbstmjQZ8UFSn.png)

Everything went well within a few days of its lifecycle. No abnormal CPU frequencies and hard faults were observed.

For most of the operations, there was no single source of truth (data was integrated from multiple sources including a Dynamics CRM backend), and all the operation results were stored in a fast local cache. As these operations were supposed to be transactional, a global semaphore blocked transactional operations in separate threads. This was a bad idea. We understood earlier that with a small number of jobs, there was no problem in blocking threads, but with a growing number of jobs, it was imperative that we either add some concurrency control method. We chose to use a Monitor object to allow only one thread in the critical section. This resolved any problem we faced in this architecture. But only for a few days.

We were using a custom implementation of .NET ThreadPool built by one of our senior developers. This thread pool allowed us to control the ordering and grouping of dependent jobs, which was very important for Job Scheduling. This was stable and relied upon abstraction. However, a few days later, we observed some unexpected problems. The threads in Job scheduler started starving and long-running jobs would timeout without doing any work. After diagnosing this issue for weeks, it turns out that some of the jobs were creating service objects which should be but never disposed of. This resulted in a very high number of hard faults. To make matter worse, each of these service objects had an exception resilience policy. For a job to perform an _ACID_ transaction (with stateless operations like HTTP requests), each request should be able to handle and retry transient exceptions (to support requests with return code like bad-gateway, service-unavailable, gateway-timeout, not-found, request-timeout). These exceptions with a growing number of non-transient exceptions, over time interrupted threads at high frequencies.

> If you ever get to the point where exceptions are significantly hurting your performance, you have problems in terms of your use of exceptions beyond just the performance
>
> ~ Jon Skeet

Without limiting theses policies in operations it was possible, that in some of the implementation it was possible to break the underlying framework. Sure, we could have ignored this by limiting what tasks an operation can perform. But this would have been a big anti-pattern, which we didn't want to introduce. The problem with this kind of .practice was that there were too many touch points, any of which, could have been diastrous at their worst or atleast a setback to throughput (which btw is death of a scheduler).

After a long tiring week of debugging, some more concurrency issues were found. It became difficult for us to pinpoint what all changes were required to fix this system. It was at this time when we realized that more fixes are not going to solve anything. 

> We had to resesign!

@[attribution="https://xkcd.com"]
