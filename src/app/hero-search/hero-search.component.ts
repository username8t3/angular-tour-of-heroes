import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.css']
})
export class HeroSearchComponent implements OnInit {
  heroes$: Observable<Hero[]>;
  private searchTerms = new Subject<string>();

  constructor(private heroService: HeroService) { }

  // Вставляем поисковый запрос в наблюдаемый поток.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.heroes$ = this.searchTerms.pipe(
      // Ждём 300 мс после каждого нажатия клавиши, прежде чем рассматривать условие(запрос?).
      debounceTime(300),

      // Игнорируем новое условие, если он совпадает с предыдущим условием.
      distinctUntilChanged(),

      // Переключаемся на новый поиск, наблюдаемый каждый раз при изменении условия.
      switchMap((term: string) => this.heroService.searchHeroes(term))
    );
  }
}

/*

Каждый оператор работает следующим образом:

  debounceTime(300)ожидает, пока поток событий новой строки
  не приостанавливается на 300 миллисекунд,
  прежде чем передать последнюю строку.
  Вы никогда не будете делать запросы чаще, чем 300 мс.

  distinctUntilChanged() гарантирует, что запрос будет отправлен
  только в случае изменения текста фильтра.

  switchMap()вызывает службу поиска для каждого пройденного
  поискового запроса debounce()и distinctUntilChanged().
  Он отменяет и отбрасывает предыдущие наблюдаемые поисковые
  объекты, возвращая только последние наблюдаемые поисковые
  службы.

*/
