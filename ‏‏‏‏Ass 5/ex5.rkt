#lang racket

(provide (all-defined-out))

(define integers-from
  (lambda (n)
    (cons-lzl n (lambda () (integers-from (+ n 1))))))

(define sqrt (lambda (x init epsilon) (sqrt-iter x init epsilon)))

(define sqrt-iter
  (lambda (x guess epsilon)
     (if (good-enough? guess x epsilon)
         guess
         (sqrt-iter x (improve guess x) epsilon))))

(define abs (lambda (x) (if (< x 0) (- x) x)))
(define square (lambda (x) (* x x)))

(define good-enough?
  (lambda (guess x epsilon)
     (< (abs (- (square guess) x)) epsilon)))
(define acc
  (lambda (guess x)
     (abs (- (square guess) x))))

(define average
  (lambda (x y) (/ (+ x y) 2)))

(define improve
  (lambda (guess x)
    (average guess (/ x guess))))

(define cons-lzl cons)
(define empty-lzl? empty?)
(define empty-lzl '())
(define head car)
(define tail
  (lambda (lzl)
    ((cdr lzl))))

(define take
  (lambda (lz-lst n)
    (if (or (= n 0) (empty-lzl? lz-lst))
      empty-lzl
      (cons (head lz-lst)
            (take (tail lz-lst) (- n 1))))))

;;; Q1


;;Signature: sqrt-lzl(x, init)
;;Purpose: Generate a lazy list of approximations (pairs of <guess, accuracy>) of the square root of the given number x, according to Newton method, starting from init guess.
;;Type: [Number * Number -> LzlList<Pair<Number,Number>>
;;Pre-condition: init =/= 0
;;Tests: (take (sqrt-lzl 2 1) 3) →  '((1 . 1) (3/2 . 1/4) (17/12 . 1/144)) 
(define sqrt-lzl 
  (lambda (x init)
   (if (= init 0)
       (cons-lzl x (lambda() empty-lzl))
       (cons-lzl
        (cons-lzl init (acc init x))
                 (lambda()
                   (sqrt-lzl x (improve init x)))))
  )
)



;;Signature: find-first(lzlst, p)
;;Purpose: Return the first item in the given lazy list which satisfies the given predicate. If no such item exists return 'fail.
;;Type: [[LzlList<T> * T->Boolean] -> T | {'fail} ]
;;Pre-condition: /
;;Tests: (find-first (integers-from 1) (lambda (x) (> x 10))) --> 11; (find-first (cons-lzl 1 (lambda() (cons-lzl 2 (lambda () '())))) (lambda (x) (> x 10))) --> 'fail
(define find-first
  (lambda (lz-lst p)
    (if (empty-lzl? lz-lst)'fail
      (if (p (head lz-lst))
          (head lz-lst)
          (find-first (tail lz-lst)p))))
    )

;;Signature: sqrt2(x,init,epsilon)
;;Purpose: return approximation of the square root of the given number x, according to Newton method, starting from init guess with epsilon threshold.  The procedure uses sqrt-lzl and find-first procedures.
;;Type: [Number * Number * Number -> Number]
;;Pre-condition: init =/= 0
;;Tests: (sqrt2 2 1 0.0001) → 1 169/408
(define sqrt2
  (lambda (x init epsilon)
   (car (find-first (sqrt-lzl x init) ( lambda (y)(good-enough? (car y) x epsilon))))
  )
)


;;;; Q2

;;Signature: get-value(assoc-list, key)
;;Purpose: Find the value of 'key'. If 'key' is not found return �fail.
;;Type: [List<Pair(Symbol,T)>*Symbol -> T | 'fail)
;;Tests: (get-value '((a . 3) (b . 4)) 'b) --> 4,(get-value '((a . 3) (b . 4)) 'c) --> 'fail
(define get-value
  (lambda (assoc-list key)
   (cond ( (empty? assoc-list)'fail)
    ((equal? (caar assoc-list) key)(cdr(car assoc-list)))
    (else (get-value (cdr assoc-list) key))
    )
    )
)

;;Signature: get-value$(assoc-list, key, success, fail)
;;Purpose: Find the value of 'key'. If 'key' is found, then apply the continuation 'success' on its value val. Otherwise, apply the continuation 'fail'.
;;Type: [List<Pair<Symbol,T>>*Symbol*[T>->T1] * [Empty->T2]] -> T1 | T2)
;;Tests: > (get-value$ '((a . 3) (b . 4)) 'b (lambda(x) (* x x )) (lambda()#f)) --> 16, (get-value$ '((a . 3) (b . 4)) 'c (lambda(x) (* x x)) (lambda()#f)) --> #f
(define get-value$
  (lambda (assoc-list key success fail)
   (cond ((empty? assoc-list) (fail) )
         ((equal? (caar assoc-list) key)(success (cdr (car assoc-list))))
         (else (get-value$ (cdr assoc-list) key
               success fail)))
  )
)

;;Signature: collect-all-values(list-assoc-lists, key)
;;Purpose: Returns a list of all values of the first occurrence of 'key' in each of the given association lists. If no such value, returns the empty list.
;;Type: [List<List<Pair<Symbol,T>>>*Symbol -> List<T>]
;;Tests: 


(define collect-all-values-1
 (lambda (lists key)
  (cond ((empty? lists)'())
   ((equal? (get-value (car lists) key) 'fail) (collect-all-values-1 (cdr lists )key))
   (else (cons (get-value (car lists) key) (collect-all-values-1 (cdr lists )key)))
    
   )
   )
 )


(define collect-all-values-2
 (lambda (lists key)
   (letrec
       ((collect$
             (lambda (li key con)
               (cond((empty? li)(con '()))
                     (else(collect$ (cdr li) key
                               (lambda (x)
                              (get-value$ (car li)key (lambda (y) (con (cons y x)))
                                                    (lambda() (con x))))))))))
     (collect$ lists key
               (lambda (x) x)))))
                                 




