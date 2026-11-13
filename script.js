function locomotiveScrollTriggerSetup() {

  gsap.registerPlugin(ScrollTrigger);

  // Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

  const locoScroll = new LocomotiveScroll({
    el: document.querySelector("main"),
    smooth: true
  });
  // each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
  locoScroll.on("scroll", ScrollTrigger.update);

  // tell ScrollTrigger to use these proxy methods for the "main" element since Locomotive Scroll is hijacking things
  ScrollTrigger.scrollerProxy("main", {
    scrollTop(value) {
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    }, // we don't have to define a scrollLeft because we're only scrolling vertically.
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
    pinType: document.querySelector("main").style.transform ? "transform" : "fixed"
  });

  // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll.
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

  // images (like the profile photo) change the page height once loaded, so re-measure then
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
  ScrollTrigger.refresh();

}

// rotating an arrow in navbar
function rotatingArrow() {

  gsap.to("nav svg", {
    rotate: 90,
    duration: 1,
    backgroundColor: "#111",
    scrollTrigger: {
      trigger: "nav svg",
      scroller: "main",
      start: "top -5%",
      end: "top -6%",
      scrub: 1
    }
  })
  gsap.to("nav svg", {
    backgroundColor: "#111",
    scrollTrigger: {
      trigger: "nav svg",
      scroller: "main",
      start: "top -15%",
      end: "top -400%",
      scrub: 3
    }
  })
}

// scrolling a namediv + section reveal animations
function scrollingNamediv() {

  gsap.to("#name-div h1", {
    transform: "translateX(calc(-100% - 2vw - 4px))",
    scrollTrigger: {
      trigger: "#name-div h1",
      scroller: "main",
      // markers:true,
      scrub: 0.7
    }
  })

  gsap.from("#intro-div h1:nth-child(1)", {
    scrollTrigger: {
      trigger: "#intro-div h1:nth-child(1)",
      scroller: "main",
      start: "top 70%"
    },
    opacity: 0
  })
  gsap.from("#intro-div h1:nth-child(2)", {
    scrollTrigger: {
      trigger: "#intro-div h1:nth-child(2)",
      scroller: "main",
      start: "top 60%"
    },
    duration: 1,
    opacity: 0
  })
  gsap.from("#intro-div h1:nth-child(4)", {
    scrollTrigger: {
      trigger: "#intro-div h1:nth-child(4)",
      scroller: "main",
      start: "top 60%",
    },
    opacity: 0,
    duration: 1,
  })
  gsap.from("#intro-div h1:nth-child(6)", {
    scrollTrigger: {
      trigger: "#intro-div h1:nth-child(6)",
      scroller: "main",
      start: "top 60%",
    },
    opacity: 0,
    duration: 1,
  })

  // skill group headings
  gsap.from(".box h4", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".box h4",
      scroller: "main",
      start: "top 70%"
    },
    stagger: 0.5
  })

  // skill chips, one group at a time
  gsap.from(".dev-box .chip", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".dev-box .chip",
      scroller: "main",
      start: "top 80%"
    },
    y: 20,
    stagger: {
      amount: 1.5
    }
  })
  gsap.from(".des-box .chip", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".des-box .chip",
      scroller: "main",
      start: "top 80%"
    },
    y: 20,
    stagger: {
      amount: 1
    }
  })
  gsap.from(".pcb-box .chip", {
    opacity: 0,
    scrollTrigger: {
      trigger: ".pcb-box .chip",
      scroller: "main",
      start: "top 85%"
    },
    y: 20,
    stagger: {
      amount: 1
    }
  })

  // project cards
  gsap.from("#work-sample .card", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    scrollTrigger: {
      trigger: "#work-sample",
      scroller: "main",
      start: "top 80%"
    },
    stagger: 0.15
  })
}

locomotiveScrollTriggerSetup()
rotatingArrow()
scrollingNamediv()
